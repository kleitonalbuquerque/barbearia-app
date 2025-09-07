import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/payments - Listar todos os pagamentos
export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: { appointment: true },
      orderBy: { paidAt: 'desc' },
    });
    return NextResponse.json({ success: true, payments });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro ao listar pagamentos', error }, { status: 500 });
  }
}

// POST /api/payments - Criar pagamento
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { appointmentId, method, amountCents, paidAt } = data;
    if (!appointmentId || !method || !amountCents) {
      return NextResponse.json({ success: false, message: 'Campos obrigatórios: appointmentId, method, amountCents' }, { status: 400 });
    }
    // Garante pagamento único por agendamento
    const exists = await prisma.payment.findUnique({ where: { appointmentId } });
    if (exists) {
      return NextResponse.json({ success: false, message: 'Já existe pagamento para este agendamento' }, { status: 409 });
    }
    const payment = await prisma.payment.create({
      data: { appointmentId, method, amountCents, paidAt },
    });
    return NextResponse.json({ success: true, message: 'Pagamento registrado com sucesso!', payment });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro ao criar pagamento', error }, { status: 500 });
  }
}
