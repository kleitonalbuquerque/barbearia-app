import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Criar profissional
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // Verifica duplicidade apenas se email, cpf ou cnpj forem informados
    const orConditions = [];
    if (data.email) orConditions.push({ email: data.email });
    if (data.cpf) orConditions.push({ cpf: data.cpf });
    if (data.cnpj) orConditions.push({ cnpj: data.cnpj });
    let existing = null;
    if (orConditions.length > 0) {
      existing = await prisma.professional.findFirst({ where: { OR: orConditions } });
    }
    if (existing) {
      return NextResponse.json({ success: false, error: 'Já existe profissional com este email, CPF ou CNPJ.' }, { status: 400 });
    }
    if (!data.tenantId) {
      return NextResponse.json({ success: false, error: 'tenantId é obrigatório.' }, { status: 400 });
    }
    const professional = await prisma.professional.create({
      data: {
        name: data.name,
        email: data.email ? data.email : null,
        phone: data.phone ? data.phone : null,
        cpf: data.cpf ? data.cpf : null,
        cnpj: data.cnpj ? data.cnpj : null,
        status: 'ACTIVE',
        tenant: { connect: { id: data.tenantId } },
      },
    });
    return NextResponse.json({
      success: true,
      message: 'Profissional criado com sucesso!',
      professional,
      frontendMessage: 'Profissional cadastrado com sucesso!'
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

// Listar profissionais
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
    const tenantId = searchParams.get('tenantId');
  const where: Record<string, any> = {};
    if (tenantId) where.tenantId = tenantId;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' as const } },
        { email: { contains: q, mode: 'insensitive' as const } },
        { phone: { contains: q, mode: 'insensitive' as const } },
        { cpf: { contains: q, mode: 'insensitive' as const } },
      ];
    }
    const total = await prisma.professional.count({ where });
    const professionals = await prisma.professional.findMany({
      where,
      orderBy: { [orderBy]: orderDir },
      skip,
      take,
    });
    return NextResponse.json({ success: true, professionals, total, page, pageSize });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}