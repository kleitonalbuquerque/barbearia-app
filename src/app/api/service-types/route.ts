import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperadmin } from '../../../utils/requireSuperadmin';


// Criar tipo de serviço
export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth) return auth;
  try {
    const data = await request.json();
    // Verifica se já existe tipo de serviço com o mesmo nome
    const existing = await prisma.serviceType.findFirst({
      where: { name: data.name }
    });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Já existe tipo de serviço com este nome.' }, { status: 400 });
    }
    if (!data.tenantId) {
      return NextResponse.json({ success: false, error: 'tenantId é obrigatório.' }, { status: 400 });
    }
    const serviceType = await prisma.serviceType.create({
      data: {
        name: data.name,
        durationMinutes: data.durationMinutes,
        priceCents: data.priceCents,
        paymentAllowed: data.paymentAllowed,
        countsAsHaircut: data.countsAsHaircut ?? false,
        tenant: { connect: { id: data.tenantId } },
      },
    });
    return NextResponse.json({ success: true, message: 'Tipo de serviço criado com sucesso!', serviceType });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

// Listar tipos de serviço
export async function GET() {
  try {
    // Recebe tenantId via query
    const searchParams = typeof window === 'undefined' ? new URL(globalThis.location?.href || '').searchParams : new URL(window.location.href).searchParams;
    const tenantSlug = searchParams.get('tenantId');
    let tenantId: string | undefined = undefined;
    if (tenantSlug) {
      const tenant = await prisma.tenant.findUnique({ where: { subdomain: tenantSlug } });
      if (tenant) tenantId = tenant.id;
    }
  const where: import('@prisma/client').Prisma.ServiceTypeWhereInput = {};
    if (tenantId) where.tenantId = tenantId;
    const serviceTypes = await prisma.serviceType.findMany({ where });
    return NextResponse.json({ success: true, serviceTypes });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
