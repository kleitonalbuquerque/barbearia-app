/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperadmin } from './utils';


export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth) return auth;
  try {
    const data = await request.json();
    // Verifica duplicidade apenas se email, cpf ou cnpj forem informados
    const orConditions = [];
    if (data.email) orConditions.push({ email: data.email });
    if (data.cpf) orConditions.push({ cpf: data.cpf });
    if (data.cnpj) orConditions.push({ cnpj: data.cnpj });
    let existing = null;
    if (orConditions.length > 0) {
      existing = await prisma.barber.findFirst({ where: { OR: orConditions } });
    }
    if (existing) {
      return NextResponse.json({ success: false, error: 'Já existe barbeiro com este email, CPF ou CNPJ.' }, { status: 400 });
    }
    const barber = await prisma.barber.create({
      data: {
        name: data.name,
        email: data.email ? data.email : null,
        phone: data.phone ? data.phone : null,
        cpf: data.cpf ? data.cpf : null,
        cnpj: data.cnpj ? data.cnpj : null,
        status: 'ACTIVE',
      },
    });
    return NextResponse.json({
      success: true,
      message: 'Barbeiro criado com sucesso!',
      barber,
      frontendMessage: 'Barbeiro cadastrado com sucesso!'
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const orderBy = searchParams.get('orderBy') || 'createdAt';
    const orderDir = (searchParams.get('orderDir') as 'asc' | 'desc') || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { email: { contains: q, mode: 'insensitive' as const } },
            { phone: { contains: q, mode: 'insensitive' as const } },
            { cpf: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : undefined;
    const total = await prisma.barber.count({ where });
    const barbers = await prisma.barber.findMany({
      where,
      orderBy: { [orderBy]: orderDir },
      skip,
      take,
    });
    return NextResponse.json({ success: true, barbers, total, page, pageSize });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
