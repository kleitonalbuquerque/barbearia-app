import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Criar agendamento
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // Validação de existência de barberId, clientId
    const barber = await prisma.barber.findUnique({ where: { id: data.barberId } });
    if (!barber) {
      return NextResponse.json({ success: false, message: 'Barbeiro não encontrado.' }, { status: 400 });
    }
    const client = await prisma.client.findUnique({ where: { id: data.clientId } });
    if (!client) {
      return NextResponse.json({ success: false, message: 'Cliente não encontrado.' }, { status: 400 });
    }
    // Validação de serviceTypeId em todos os itens
    for (const item of data.items) {
      const serviceType = await prisma.serviceType.findUnique({ where: { id: item.serviceTypeId } });
      if (!serviceType) {
        return NextResponse.json({ success: false, message: `Tipo de serviço não encontrado: ${item.serviceTypeId}` }, { status: 400 });
      }
    }
    // Verifica conflito de horário para o barbeiro
    const conflict = await prisma.appointment.findFirst({
      where: {
        barberId: data.barberId,
        status: { in: ['SCHEDULED', 'COMPLETED'] },
        OR: [
          {
            startAt: { lte: data.endAt },
            endAt: { gte: data.startAt }
          }
        ]
      }
    });
    if (conflict) {
      return NextResponse.json({ success: false, message: 'Conflito de horário para o barbeiro.' }, { status: 400 });
    }
    // Cria o agendamento
    const appointment = await prisma.appointment.create({
      data: {
        barberId: data.barberId,
        clientId: data.clientId,
        startAt: data.startAt,
        endAt: data.endAt,
        status: data.status || 'SCHEDULED',
        items: {
          create: (data.items as { serviceTypeId: string; priceCentsSnapshot: number; durationMinutesSnapshot: number }[]).map((item) => ({
            serviceTypeId: item.serviceTypeId,
            priceCentsSnapshot: item.priceCentsSnapshot,
            durationMinutesSnapshot: item.durationMinutesSnapshot
          }))
        }
      },
      include: { items: true }
    });
    return NextResponse.json({ success: true, message: 'Agendamento criado com sucesso!', appointment });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

// Listar agendamentos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const where: {
      barberId?: string;
      clientId?: string;
      status?: string;
      startAt?: { gte: string };
      endAt?: { lte: string };
    } = {};
  where.barberId = searchParams.get('barberId') ?? undefined;
  where.clientId = searchParams.get('clientId') ?? undefined;
  where.status = searchParams.get('status') ?? undefined;
  where.startAt = searchParams.get('startAt') ? { gte: searchParams.get('startAt')! } : undefined;
  where.endAt = searchParams.get('endAt') ? { lte: searchParams.get('endAt')! } : undefined;
    const appointments = await prisma.appointment.findMany({ where, include: { items: true } });
    return NextResponse.json({ success: true, appointments });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
