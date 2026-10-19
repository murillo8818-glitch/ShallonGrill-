// app/api/products/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const all = searchParams.get('all'); // admin: show inactive too

    const where = all ? {} : { active: true };
    if (categoryId) where.categoryId = parseInt(categoryId);

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: [{ featured: 'desc' }, { id: 'desc' }],
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = requireAuth(request);
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const body = await request.json();
    const { name, description, price, imageUrl, categoryId, featured, active } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: 'Nome, preço e categoria são obrigatórios' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        imageUrl: imageUrl || null,
        categoryId: parseInt(categoryId),
        featured: featured ?? false,
        active: active ?? true,
      },
      include: { category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
  }
}
