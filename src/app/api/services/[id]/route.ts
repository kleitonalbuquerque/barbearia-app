import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { name, priceCents, durationMinutes } = body;
    if (!name || typeof priceCents !== 'number' || typeof durationMinutes !== 'number') {
      return NextResponse.json({ success: false, error: 'Dados inválidos.' }, { status: 400 });
    }
    const updated = await prisma.serviceType.update({
      where: { id: params.id },
      data: { name, priceCents, durationMinutes },
    });
    return NextResponse.json({ success: true, service: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    const { params } = context;
    if (!params || !params.id) {
      return NextResponse.json({ success: false, error: 'ID não informado.' }, { status: 400 });
    }
    const service = await prisma.serviceType.findUnique({ where: { id: params.id } });
    if (!service) {
      return NextResponse.json({ success: false, error: 'Serviço não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, service });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
