import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Nichos e cores pré-definidos
const NICHOS = {
  barbearia: {
    primaryColor: '#1976d2',
    secondaryColor: '#ff9800',
    labels: { agendamento: 'Agendamento', profissional: 'Profissional' }
  },
  consultorio: {
    primaryColor: '#388e3c',
    secondaryColor: '#fbc02d',
    labels: { agendamento: 'Consulta', profissional: 'Especialista' }
  },
  clinica_estetica: {
    primaryColor: '#8e24aa',
    secondaryColor: '#ffb300',
    labels: { agendamento: 'Sessão', profissional: 'Esteticista' }
  }
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, subdomain, businessType, admin } = data;
    if (!name || !subdomain || !businessType || !admin || !admin.name || !admin.email || !admin.password) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios não preenchidos.' }, { status: 400 });
    }
    // Verifica duplicidade de subdomínio
    const existing = await prisma.tenant.findUnique({ where: { subdomain } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Subdomínio já existe.' }, { status: 400 });
    }
    // Branding padrão do nicho
  const branding = NICHOS[(businessType as keyof typeof NICHOS)] || NICHOS['barbearia'];
    // Cria tenant e usuário admin
    const tenant = await prisma.tenant.create({
      data: {
        name,
        subdomain,
        businessType,
        branding,
        users: {
          create: [{
            name: admin.name,
            email: admin.email,
            password: await bcrypt.hash(admin.password, 10),
            role: 'ADMIN',
            phone: admin.phone || '',
          }],
        },
      },
    });
    return NextResponse.json({ success: true, tenant });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
