import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';


export async function POST(request: Request) {
  try {
    const { name, email, password, phone, cpf, cnpj, tenantId } = await request.json();
    // Verifica se já existe admin com email, cpf ou cnpj
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { cpf: cpf || undefined },
          { cnpj: cnpj || undefined }
        ]
      }
    });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Já existe admin com este email, CPF ou CNPJ.' }, { status: 400 });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hash,
        role: 'ADMIN',
        phone,
        cpf: cpf || null,
        cnpj: cnpj || null,
        tenantId
      }
    });
    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
