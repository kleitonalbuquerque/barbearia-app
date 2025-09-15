import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperadmin } from '../../../../utils/requireSuperadmin';


// Buscar tipo de serviço por ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const serviceType = await prisma.serviceType.findUnique({ where: { id } });
    if (!serviceType) {
      return NextResponse.json({ success: false, error: 'Tipo de serviço não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, serviceType });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

// Atualizar tipo de serviço
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperadmin(request);
  if (auth) return auth;
  try {
    const { id } = await params;
    const data = await request.json();
    const updated = await prisma.serviceType.update({
      where: { id },
      data,
    });
    return NextResponse.json({ success: true, serviceType: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

// Deletar tipo de serviço
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperadmin(request);
  if (auth) return auth;
  try {
    const { id } = await params;
    await prisma.serviceType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
