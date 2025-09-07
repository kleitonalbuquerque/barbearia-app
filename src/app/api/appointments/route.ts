import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendMail } from '../../../lib/mailer';

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

    // Busca dados do barbeiro, cliente e serviço para o e-mail
    const [barberFull, clientFull, serviceType] = await Promise.all([
      prisma.barber.findUnique({ where: { id: data.barberId } }),
      prisma.client.findUnique({ where: { id: data.clientId } }),
      prisma.serviceType.findUnique({ where: { id: data.items[0].serviceTypeId } })
    ]);
    // Ajuste de fuso horário para America/Sao_Paulo
    const dateBr = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(data.startAt));
    const valor = (serviceType?.priceCents || 0) / 100;
    const nomeBarbeiro = barberFull?.name || 'Barbeiro';
  // Separar data e hora para formatar "às"
  const [dataStr, horaStrRaw] = dateBr.split(', ');
  // Adiciona 'h' ao final do horário (ex: 13:00h)
  const horaStr = horaStrRaw ? `${horaStrRaw}h` : '';
  const dataHoraBr = `${dataStr} às ${horaStr}`;
  const msg = `${clientFull?.name || 'Cliente'}, foi criado um agendamento para ${dataHoraBr} do serviço ${serviceType?.name || ''} (R$ ${valor.toFixed(2)}) com o barbeiro ${nomeBarbeiro} em nossa barbearia. Obrigado pela confiança! 😊`;
  const msgHtml = `${clientFull?.name || 'Cliente'}, foi criado um agendamento para ${dataHoraBr} do serviço <strong>${serviceType?.name || ''}</strong> (R$ ${valor.toFixed(2)}) com o barbeiro ${nomeBarbeiro} em nossa barbearia. Obrigado pela confiança! 😊`;
    // Envia e-mail para cliente
    if (clientFull?.email) {
      await sendMail({
        to: clientFull.email,
        subject: 'Confirmação de Agendamento - Barbearia',
        text: msg,
        html: msgHtml
      });
    }
    // Envia e-mail para barbeiro
    if (barberFull?.email) {
      await sendMail({
        to: barberFull.email,
        subject: 'Novo Agendamento - Barbearia',
        text: msg,
        html: msgHtml
      });
    }
    return NextResponse.json({ success: true, message: 'Agendamento criado com sucesso!', appointment });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

// Listar agendamentos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filtros
    const statusParam = searchParams.get('status');
    let status: string | string[] | undefined = undefined;
    if (statusParam) {
      if (statusParam.includes(',')) {
        status = statusParam.split(',').map(s => s.trim());
      } else {
        status = statusParam;
      }
    }

    const serviceTypeId = searchParams.get('serviceTypeId');
    const clientName = searchParams.get('clientName');
    const barberName = searchParams.get('barberName');

    const where: Record<string, unknown> = {};
    where.barberId = searchParams.get('barberId') ?? undefined;
    where.clientId = searchParams.get('clientId') ?? undefined;
    if (status) {
      if (Array.isArray(status)) {
        where.status = { in: status };
      } else {
        where.status = status;
      }
    }
    where.startAt = searchParams.get('startAt') ? { gte: searchParams.get('startAt')! } : undefined;
    where.endAt = searchParams.get('endAt') ? { lte: searchParams.get('endAt')! } : undefined;

    // Filtro por serviceTypeId (precisa filtrar por items)
    if (serviceTypeId) {
      where.items = { some: { serviceTypeId } };
    }

    // Filtro por nome do cliente (busca textual, case-insensitive)
    if (clientName) {
      where.client = { name: { contains: clientName, mode: 'insensitive' } };
    }
    // Filtro por nome do barbeiro (busca textual, case-insensitive)
    if (barberName) {
      where.barber = { name: { contains: barberName, mode: 'insensitive' } };
    }

    // Paginação
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Ordenação customizável
    const orderByParam = searchParams.get('orderBy') || 'startAt';
    const orderParam = searchParams.get('order') || 'desc';
  const orderBy: Record<string, 'asc' | 'desc'> = {};
  orderBy[orderByParam] = orderParam === 'asc' ? 'asc' : 'desc';

    // Busca total de registros para os filtros
    const total = await prisma.appointment.count({ where });
    // Busca paginada
    const appointments = await prisma.appointment.findMany({
      where,
      include: { items: true },
      skip,
      take,
      orderBy
    });
    return NextResponse.json({ success: true, appointments, total, page, pageSize });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
