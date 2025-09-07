/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireSuperadmin } from './utils';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth) return auth;
  try {
    const data = await request.json();
    // Verifica se já existe barbeiro com email, cpf ou cnpj
    const existing = await prisma.barber.findFirst({
      where: {
        OR: [
          { email: data.email },
          { cpf: data.cpf },
          { cnpj: data.cnpj || undefined }
        ]
      }
    });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Já existe barbeiro com este email, CPF ou CNPJ.' }, { status: 400 });
    }
    const barber = await prisma.barber.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        cnpj: data.cnpj || null,
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

export async function GET() {
  try {
    const barbers = await prisma.barber.findMany();
    return NextResponse.json({ success: true, barbers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
