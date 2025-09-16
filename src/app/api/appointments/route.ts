import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMail } from '../../../lib/mailer';


// Criar agendamento
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // Validação de existência de professionalId, clientId
    const professional = await prisma.professional.findUnique({ where: { id: data.professionalId } });
    if (!professional) {
      return NextResponse.json({ success: false, message: 'Profissional não encontrado.' }, { status: 400 });
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
    // Verifica conflito de horário para o profissional
    const conflict = await prisma.appointment.findFirst({
      where: {
        professionalId: data.professionalId,
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
      return NextResponse.json({ success: false, message: 'Conflito de horário para o profissional.' }, { status: 400 });
    }
    // Cria o agendamento
    const appointment = await prisma.appointment.create({
      data: {
        professionalId: data.professionalId,
        clientId: data.clientId,
        tenantId: data.tenantId, // obrigatório para multi-tenancy
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
      include: {
        items: { include: { serviceType: true } },
        professional: true,
        client: { select: { id: true, name: true } }
      }
    });

    // Busca dados do profissional, cliente e serviço para o e-mail
    const [professionalFull, clientFull, serviceType] = await Promise.all([
      prisma.professional.findUnique({ where: { id: data.professionalId } }),
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
  const nomeProfissional = professionalFull?.name || 'Profissional';
  // Separar data e hora para formatar "às"
  const [dataStr, horaStrRaw] = dateBr.split(', ');
  // Adiciona 'h' ao final do horário (ex: 13:00h)
  const horaStr = horaStrRaw ? `${horaStrRaw}h` : '';
  const dataHoraBr = `${dataStr} às ${horaStr}`;
  const msg = `${clientFull?.name || 'Cliente'}, foi criado um agendamento para ${dataHoraBr} do serviço ${serviceType?.name || ''} (R$ ${valor.toFixed(2)}) com o profissional ${nomeProfissional} em nosso estabelecimento. Obrigado pela confiança! 😊`;
  const msgHtml = `${clientFull?.name || 'Cliente'}, foi criado um agendamento para ${dataHoraBr} do serviço <strong>${serviceType?.name || ''}</strong> (R$ ${valor.toFixed(2)}) com o profissional ${nomeProfissional} em nosso estabelecimento. Obrigado pela confiança! 😊`;
    // Envia e-mail para cliente
    if (clientFull?.email) {
      await sendMail({
        to: clientFull.email,
        subject: 'Confirmação de Agendamento - Barbearia',
        text: msg,
        html: msgHtml
      });
    }
    // Envia e-mail para profissional
    if (professionalFull?.email) {
      await sendMail({
        to: professionalFull.email,
        subject: 'Novo Agendamento - Estabelecimento',
        text: msg,
        html: msgHtml
      });
    }
    return NextResponse.json({ success: true, message: 'Agendamento criado com sucesso!', appointment });
  // Agora appointment já vem com professional, client e items.serviceType populados
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

// Listar agendamentos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filtro por tenantId (slug)
    const tenantSlug = searchParams.get('tenantId');
    let tenantId: string | undefined = undefined;
    if (tenantSlug) {
      const tenant = await prisma.tenant.findUnique({ where: { subdomain: tenantSlug } });
      if (tenant) tenantId = tenant.id;
    }

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
    const professionalName = searchParams.get('professionalName');
    const q = searchParams.get('q');

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    where.professionalId = searchParams.get('professionalId') ?? undefined;
    where.clientId = searchParams.get('clientId') ?? undefined;
    if (status) {
      if (Array.isArray(status)) {
        where.status = { in: status };
      } else {
        where.status = status;
      }
    }
    // Corrige filtro de data: se vier só a data (YYYY-MM-DD), converte para início do dia ISO
    const startAtParam = searchParams.get('startAt');
    if (startAtParam) {
      let startAtIso = startAtParam;
      if (/^\d{4}-\d{2}-\d{2}$/.test(startAtParam)) {
        startAtIso = new Date(startAtParam + 'T00:00:00').toISOString();
      }
      where.startAt = { gte: startAtIso };
    } else {
      where.startAt = undefined;
    }
    const endAtParam = searchParams.get('endAt');
    if (endAtParam) {
      let endAtIso = endAtParam;
      if (/^\d{4}-\d{2}-\d{2}$/.test(endAtParam)) {
        endAtIso = new Date(endAtParam + 'T23:59:59.999').toISOString();
      }
      where.endAt = { lte: endAtIso };
    } else {
      where.endAt = undefined;
    }

    // Filtro por serviceTypeId (precisa filtrar por items)
    if (serviceTypeId) {
      where.items = { some: { serviceTypeId } };
    }

    // Busca textual global (q)
    if (q) {
      where.OR = [
        { client: { name: { contains: q, mode: 'insensitive' } } },
        { professional: { name: { contains: q, mode: 'insensitive' } } },
        { items: { some: { serviceType: { name: { contains: q, mode: 'insensitive' } } } } },
      ];
    } else {
      // Filtro por nome do cliente (busca textual, case-insensitive)
      if (clientName) {
        where.client = { name: { contains: clientName, mode: 'insensitive' } };
      }
      // Filtro por nome do profissional (busca textual, case-insensitive)
      if (professionalName) {
        where.professional = { name: { contains: professionalName, mode: 'insensitive' } };
      }
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
    const include: {
      items: { include: { serviceType: boolean } };
      professional?: boolean;
      client?: { select: { id: true; name: true } };
      payment?: boolean;
    } = { items: { include: { serviceType: true } }, payment: true };
    // Permitir incluir profissional se solicitado (para compatibilidade com frontend)
    if (searchParams.get('includeProfessional') === 'true') {
      include.professional = true;
    }
    // Permitir incluir client se solicitado (para mostrar nome do cliente na tabela do profissional)
    if (searchParams.get('includeClient') === 'true') {
      include.client = { select: { id: true, name: true } };
    }
    const appointments = await prisma.appointment.findMany({
      where,
      include,
      skip,
      take,
      orderBy
    });
    return NextResponse.json({ success: true, appointments, total, page, pageSize });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
