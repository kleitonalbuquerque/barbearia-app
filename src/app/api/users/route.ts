import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/utils/jwt';
import bcrypt from 'bcryptjs';


// Listar usuários admin (GET)
export async function GET(request: Request) {
  // Verifica autenticação e se é admin
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/auth_token=([^;]+)/);
  if (!match) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
  const token = match[1];
  const payload = verifyJwt(token);
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Acesso restrito a administradores' }, { status: 403 });
  }
  const users = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true, name: true, email: true, createdAt: true } });
  return NextResponse.json({ success: true, users });
}

// Criar novo admin (POST)
export async function POST(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/auth_token=([^;]+)/);
  if (!match) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
  const token = match[1];
  const payload = verifyJwt(token);
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Acesso restrito a administradores' }, { status: 403 });
  }
  const { name, email, password, phone = "", cpf = "", cnpj = "", tenantId } = await request.json();
  if (!name || !email || !password || !phone) {
    return NextResponse.json({ success: false, error: 'Dados obrigatórios ausentes (nome, email, senha e telefone)' }, { status: 400 });
  }
  // Validação de formato de e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ success: false, error: 'E-mail inválido. Use um formato válido, ex: nome@email.com' }, { status: 400 });
  }
  // Validação de CPF (opcional, se informado)
  if (cpf && !/^\d{11}$/.test(cpf)) {
    return NextResponse.json({ success: false, error: 'CPF deve ter 11 dígitos numéricos.' }, { status: 400 });
  }
  // Validação de CNPJ (opcional, se informado)
  if (cnpj && !/^\d{14}$/.test(cnpj)) {
    return NextResponse.json({ success: false, error: 'CNPJ deve ter 14 dígitos numéricos.' }, { status: 400 });
  }
  // Verifica se já existe
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ success: false, error: 'Já existe usuário com este e-mail' }, { status: 400 });
  }
  // Cria admin
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, password: hash, phone, cpf: cpf || null, cnpj: cnpj || null, role: 'ADMIN', tenantId } });
  return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
}
