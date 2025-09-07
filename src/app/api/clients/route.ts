import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Criar cliente
export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Verifica se já existe cliente com email ou cpf
    const existing = await prisma.client.findFirst({
      where: {
        OR: [
          { email: data.email || undefined },
          { cpf: data.cpf }
        ]
      }
    });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Já existe cliente com este email ou CPF.' }, { status: 400 });
    }
    const client = await prisma.client.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        cpf: data.cpf,
      },
    });
    return NextResponse.json({ success: true, message: 'Cliente criado com sucesso!', client });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

// Listar clientes
export async function GET() {
  try {
    const clients = await prisma.client.findMany();
    return NextResponse.json({ success: true, clients });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
