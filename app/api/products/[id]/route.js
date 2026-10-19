// app/api/products/[id]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });
    if (!product) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const admin = requireAuth(request);
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const { id } = await params;
    const { name, description, price, imageUrl, categoryId, featured, active } = await request.json();

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        categoryId: parseInt(categoryId),
        featured,
        active,
      },
      include: { category: true },
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = requireAuth(request);
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const { id } = await params;
    // Soft delete
    await prisma.product.update({
      where: { id: parseInt(id) },
      data: { active: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover produto' }, { status: 500 });
  }
}
