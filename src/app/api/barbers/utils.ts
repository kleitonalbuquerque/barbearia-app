import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware simples para autenticação do superadmin via header Authorization (Bearer <email>)
export async function requireSuperadmin(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
  }
  const email = auth.replace('Bearer ', '').trim();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 });
  }
  return null; // autorizado
}
