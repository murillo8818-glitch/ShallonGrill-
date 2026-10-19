// app/api/orders/[id]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function PATCH(request, { params }) {
  const admin = requireAuth(request);
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const { id } = await params;
    const { status } = await request.json();

    const validStatuses = ['RECEBIDO', 'PREPARANDO', 'PRONTO', 'SAIU_ENTREGA', 'CONCLUIDO', 'CANCELADO'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: { include: { product: { select: { id: true, name: true } } } },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 });
  }
}
