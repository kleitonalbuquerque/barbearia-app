import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireSuperadmin } from '../barbers/utils';

const prisma = new PrismaClient();

// Criar tipo de serviço
export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth) return auth;
  try {
    const data = await request.json();
    // Verifica se já existe tipo de serviço com o mesmo nome
    const existing = await prisma.serviceType.findFirst({
      where: { name: data.name }
    });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Já existe tipo de serviço com este nome.' }, { status: 400 });
    }
    const serviceType = await prisma.serviceType.create({
      data: {
        name: data.name,
        durationMinutes: data.durationMinutes,
        priceCents: data.priceCents,
        paymentAllowed: data.paymentAllowed,
        countsAsHaircut: data.countsAsHaircut ?? false,
      },
    });
    return NextResponse.json({ success: true, message: 'Tipo de serviço criado com sucesso!', serviceType });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

// Listar tipos de serviço
export async function GET() {
  try {
    const serviceTypes = await prisma.serviceType.findMany();
    return NextResponse.json({ success: true, serviceTypes });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
