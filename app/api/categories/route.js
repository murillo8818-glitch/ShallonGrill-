// app/api/categories/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { products: { where: { active: true } } } } },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = requireAuth(request);
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const { name, slug, icon, order } = await request.json();
    const category = await prisma.category.create({ data: { name, slug, icon, order } });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 });
  }
}
