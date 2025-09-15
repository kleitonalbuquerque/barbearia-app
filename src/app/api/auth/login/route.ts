
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/utils/jwt';


export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const user = await prisma.user.findUnique({ where: { email }, include: { tenant: true } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Senha inválida' }, { status: 401 });
    }
    // Inclui tenantId e branding no JWT e no retorno
    const tenantId = user.tenantId;
    const branding = user.tenant?.branding || null;
    const token = signJwt({ id: user.id, email: user.email, role: user.role, tenantId, branding });
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role, tenantId, branding }
    });
    response.headers.append('Set-Cookie', `auth_token=${token}; Path=/; HttpOnly; Max-Age=86400; SameSite=Lax`);
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
