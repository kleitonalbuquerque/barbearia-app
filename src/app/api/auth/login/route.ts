
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/utils/jwt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Senha inválida' }, { status: 401 });
    }
  // Gera JWT e seta cookie httpOnly
  const token = signJwt({ id: user.id, email: user.email, role: user.role });
  const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
  response.headers.append('Set-Cookie', `auth_token=${token}; Path=/; HttpOnly; Max-Age=86400; SameSite=Lax`);
  return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
