import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireSuperadmin } from '../../barbers/utils';

const prisma = new PrismaClient();

// Buscar tipo de serviço por ID
export async function GET(request: Request, context: { params: { id: string } }) {
  const { params } = context;
  try {
    const serviceType = await prisma.serviceType.findUnique({ where: { id: params.id } });
    if (!serviceType) {
      return NextResponse.json({ success: false, error: 'Tipo de serviço não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, serviceType });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

// Atualizar tipo de serviço
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  const { params } = context;
  const auth = await requireSuperadmin(request);
  if (auth) return auth;
  try {
    const data = await request.json();
    const updated = await prisma.serviceType.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ success: true, serviceType: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

// Deletar tipo de serviço
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const { params } = context;
  const auth = await requireSuperadmin(request);
  if (auth) return auth;
  try {
    await prisma.serviceType.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
