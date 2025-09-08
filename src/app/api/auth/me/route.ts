import { NextResponse } from 'next/server';
import { verifyJwt } from '@/utils/jwt';

export async function GET(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/auth_token=([^;]+)/);
  if (!match) {
    return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
  }
  const token = match[1];
  const payload = verifyJwt(token);
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 });
  }
  // Retorna apenas dados seguros
  return NextResponse.json({ success: true, user: payload });
}
