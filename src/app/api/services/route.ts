import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// Criar serviço
export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Verifica se já existe serviço com mesmo nome (ignora se nome não informado)
    let existing = null;
    if (data.name) {
      existing = await prisma.serviceType.findFirst({ where: { name: data.name } });
    }
    if (existing) {
      return NextResponse.json({ success: false, error: 'Já existe serviço com este nome.' }, { status: 400 });
    }
    const service = await prisma.serviceType.create({
      data: {
        name: data.name,
        priceCents: data.priceCents,
        durationMinutes: data.durationMinutes,
        paymentAllowed: { set: ["CASH"] },
      },
    });
    return NextResponse.json({ success: true, message: 'Serviço criado com sucesso!', service });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

// Listar serviços com busca e ordenação
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const orderBy = searchParams.get('orderBy') || 'createdAt';
    const orderDir = (searchParams.get('orderDir') as 'asc' | 'desc') || 'desc';
    let where = {};
    if (q) {
      where = {
        name: { contains: q, mode: 'insensitive' },
      };
    }
    const services = await prisma.serviceType.findMany({
      where,
      orderBy: { [orderBy]: orderDir },
    });
    return NextResponse.json({ success: true, services });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
