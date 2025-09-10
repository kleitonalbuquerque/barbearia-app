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
    const client = await prisma.client.create({
      data: {
        name: data.name,
        email: data.email ? data.email : null,
        phone: data.phone ? data.phone : null,
        cpf: data.cpf ? data.cpf : null,
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
    const clients = await prisma.client.findMany({
      where,
      orderBy: { [orderBy]: orderDir },
    });
    return NextResponse.json({ success: true, clients });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
