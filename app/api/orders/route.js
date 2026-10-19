// app/api/orders/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// Intervalo do dia ATUAL no horário de Brasília (UTC-3, sem horário de verão desde 2019).
// Servidores na nuvem usam UTC; sem este ajuste os pedidos "sumiriam" às 21h.
const BRASIL_UTC_OFFSET_H = 3;
function intervaloDeHoje(agora = new Date()) {
  const hMs = 60 * 60 * 1000;
  const brasil = new Date(agora.getTime() - BRASIL_UTC_OFFSET_H * hMs); // "relogio" do Brasil lido via campos UTC
  const inicio = new Date(
    Date.UTC(brasil.getUTCFullYear(), brasil.getUTCMonth(), brasil.getUTCDate(), BRASIL_UTC_OFFSET_H, 0, 0, 0)
  ); // 00:00:00.000 BRT
  const fim = new Date(inicio.getTime() + 24 * hMs - 1); // 23:59:59.999 BRT
  return { inicio, fim };
}

export async function GET(request) {
  const admin = requireAuth(request);
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const historico = searchParams.get('periodo') === 'todos'; // ?periodo=todos → sem filtro de dia

    const where = status ? { status } : {};
    if (!historico) {
      const { inicio, fim } = intervaloDeHoje();
      where.createdAt = { gte: inicio, lte: fim };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { product: { select: { id: true, name: true, price: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, type, tableNumber, address, notes, items } = body;

    if (!customerName || !customerPhone || !type || !items?.length) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Calculate total
    let total = 0;
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds }, active: true } });

    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Produto ${item.productId} não encontrado`);
      const lineTotal = product.price * item.quantity;
      total += lineTotal;
      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        type,
        tableNumber: tableNumber ? parseInt(tableNumber) : null,
        address: address || null,
        notes: notes || null,
        total,
        items: { create: orderItems },
      },
      include: {
        items: { include: { product: { select: { id: true, name: true } } } },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Erro ao criar pedido' }, { status: 500 });
  }
}
