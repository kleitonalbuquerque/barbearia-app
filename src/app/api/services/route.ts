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

// Listar serviços com busca, ordenação e paginação
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const orderBy = searchParams.get('orderBy') || 'createdAt';
    const orderDir = (searchParams.get('orderDir') as 'asc' | 'desc') || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    let where = {};
    if (q) {
      where = {
        name: { contains: q, mode: 'insensitive' },
      };
    }
    const total = await prisma.serviceType.count({ where });
    const services = await prisma.serviceType.findMany({
      where,
      orderBy: { [orderBy]: orderDir },
      skip,
      take,
    });
    return NextResponse.json({ success: true, services, total, page, pageSize });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
