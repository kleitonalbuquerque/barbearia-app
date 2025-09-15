import { NextRequest, NextResponse } from 'next/server';

export async function requireSuperadmin(request: NextRequest) {
  // Exemplo: verificação de role no JWT ou header
  // Adapte conforme sua lógica de autenticação
  const userRole = request.headers.get('x-user-role');
  if (userRole !== 'SUPERADMIN') {
    return NextResponse.json({ success: false, error: 'Acesso restrito a superadmin.' }, { status: 403 });
  }
  return null;
}
