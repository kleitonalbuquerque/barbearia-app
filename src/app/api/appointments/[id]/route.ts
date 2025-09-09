import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';


// Handler compatível com Next.js 14+/Netlify/Vercel
export async function GET(request: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  let params: { id: string };
  if ('then' in context.params) {
    params = await context.params;
  } else {
    params = context.params;
  }
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

// Atualizar agendamento (compatível com Next.js 14+/Netlify/Vercel)
export async function PUT(request: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  let params: { id: string };
  if ('then' in context.params) {
    params = await context.params;
  } else {
    params = context.params;
  }
  try {
    const data = await request.json();
    const { payment, serviceTypeId, ...rest } = data;
    // Se o status for CANCELED, remove o payment associado (se existir)
    if (rest.status === 'CANCELED') {
      await prisma.payment.deleteMany({ where: { appointmentId: params.id } });
    }

    // Atualiza dados do agendamento
    await prisma.appointment.update({
      where: { id: params.id },
      data: rest,
      include: { items: true, payment: true }
    });

    // Atualiza o serviço do item (assume 1 item por agendamento)
    if (serviceTypeId) {
      // Busca preço e duração do novo serviço
      const serviceType = await prisma.serviceType.findUnique({ where: { id: serviceTypeId } });
      if (!serviceType) {
        return NextResponse.json({ success: false, message: 'Tipo de serviço não encontrado.' }, { status: 400 });
      }
      // Atualiza o item do agendamento
      await prisma.appointmentItem.updateMany({
        where: { appointmentId: params.id },
        data: {
          serviceTypeId: serviceType.id,
          priceCentsSnapshot: serviceType.priceCents,
          durationMinutesSnapshot: serviceType.durationMinutes,
        },
      });
    }

    // Se houver alteração/criação de payment e não for cancelado
    if (payment && rest.status !== 'CANCELED') {
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
    // Retorna agendamento atualizado com payment e items
    const result = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { items: true, payment: true }
    });
    return NextResponse.json({ success: true, message: 'Agendamento atualizado com sucesso!', appointment: result });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

// Deletar agendamento (compatível com Next.js 14+/Netlify/Vercel)
export async function DELETE(request: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  let params: { id: string };
  if ('then' in context.params) {
    params = await context.params;
  } else {
    params = context.params;
  }
  try {
    await prisma.appointment.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Agendamento removido com sucesso!' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
