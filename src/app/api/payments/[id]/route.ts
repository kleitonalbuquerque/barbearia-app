import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/payments/[id] - Buscar pagamento por ID
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: { appointment: true },
    });
    if (!payment) {
      return NextResponse.json({ success: false, message: 'Pagamento não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, payment });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro ao buscar pagamento', error }, { status: 500 });
  }
}

// PUT /api/payments/[id] - Atualizar pagamento
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const payment = await prisma.payment.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ success: true, message: 'Pagamento atualizado com sucesso!', payment });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro ao atualizar pagamento', error }, { status: 500 });
  }
}

// DELETE /api/payments/[id] - Deletar pagamento
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.payment.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Pagamento deletado com sucesso!' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro ao deletar pagamento', error }, { status: 500 });
  }
}
