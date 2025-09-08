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
    const { payment, ...rest } = data;
    // Atualiza dados do agendamento
    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: rest,
      include: { items: true, payment: true }
    });
    // Se houver alteração/criação de payment
    if (payment) {
      if (payment.update) {
        // Atualiza payment existente
        await prisma.payment.update({
          where: { appointmentId: params.id },
          data: payment.update,
        });
      } else if (payment.create) {
        // Cria payment se não existir
        await prisma.payment.create({
          data: {
            ...payment.create,
            appointmentId: params.id,
          },
        });
      }
    }
    // Retorna agendamento atualizado com payment
    const result = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { items: true, payment: true }
    });
    return NextResponse.json({ success: true, message: 'Agendamento atualizado com sucesso!', appointment: result });
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
