export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ success: false, error: 'ID inválido.' }, { status: 400 });
    }
    await prisma.serviceType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
function isValidUUID(uuid: string) {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid);
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Removed duplicate isValidUUID function

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ success: false, error: 'ID inválido.' }, { status: 400 });
    }
    const body = await request.json();
    const { name, priceCents, durationMinutes } = body;
    if (!name || typeof priceCents !== 'number' || typeof durationMinutes !== 'number') {
      return NextResponse.json({ success: false, error: 'Dados inválidos.' }, { status: 400 });
    }
    const updated = await prisma.serviceType.update({
      where: { id },
      data: { name, priceCents, durationMinutes },
    });
    return NextResponse.json({ success: true, service: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ success: false, error: 'ID inválido.' }, { status: 400 });
    }
    const service = await prisma.serviceType.findUnique({ where: { id } });
    if (!service) {
      return NextResponse.json({ success: false, error: 'Serviço não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, service });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
