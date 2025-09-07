import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Buscar agendamento por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { items: true }
    });
    if (!appointment) {
      return NextResponse.json({ success: false, message: 'Agendamento não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

// Atualizar agendamento
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data,
      include: { items: true }
    });
    return NextResponse.json({ success: true, message: 'Agendamento atualizado com sucesso!', appointment: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

// Deletar agendamento
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.appointment.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Agendamento removido com sucesso!' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
