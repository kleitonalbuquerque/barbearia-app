// Atualizar telefone e cpf de um cliente existente
export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    if (!data.email) {
      return NextResponse.json({ success: false, error: 'Email é obrigatório para atualizar.' }, { status: 400 });
    }
    const updated = await prisma.client.update({
      where: { email: data.email },
      data: {
        phone: data.phone,
        cpf: data.cpf,
      },
    });
    return NextResponse.json({ success: true, message: 'Cliente atualizado com sucesso!', client: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// Criar cliente
export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Verifica duplicidade apenas se email ou cpf forem informados
    const orConditions = [];
    if (data.email) orConditions.push({ email: data.email });
    if (data.cpf) orConditions.push({ cpf: data.cpf });
    let existing = null;
    if (orConditions.length > 0) {
      existing = await prisma.client.findFirst({ where: { OR: orConditions } });
    }
    if (existing) {
      return NextResponse.json({ success: false, error: 'Já existe cliente com este email ou CPF.' }, { status: 400 });
    }
    if (!data.tenantId) {
      return NextResponse.json({ success: false, error: 'tenantId é obrigatório.' }, { status: 400 });
    }
    const client = await prisma.client.create({
      data: {
        name: data.name,
        email: data.email ? data.email : null,
        phone: data.phone ? data.phone : null,
        cpf: data.cpf ? data.cpf : null,
        tenant: { connect: { id: data.tenantId } },
      },
    });
    return NextResponse.json({ success: true, message: 'Cliente criado com sucesso!', client });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

// Listar clientes com busca dinâmica
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const orderBy = searchParams.get('orderBy') || 'createdAt';
    const orderDir = (searchParams.get('orderDir') as 'asc' | 'desc') || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    let where = {};
    if (q) {
      where = {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { cpf: { contains: q, mode: 'insensitive' } },
        ],
      };
    }
    const total = await prisma.client.count({ where });
    const clients = await prisma.client.findMany({
      where,
      orderBy: { [orderBy]: orderDir },
      skip,
      take,
    });
    return NextResponse.json({ success: true, clients, total, page, pageSize });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
