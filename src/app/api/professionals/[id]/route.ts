import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/professionals/[id] - Editar profissional
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { id } = params;
		const data = await request.json();
		const updated = await prisma.professional.update({
			where: { id },
			data: {
				name: data.name,
				email: data.email,
				phone: data.phone,
				cpf: data.cpf,
				cnpj: data.cnpj,
			},
		});
		return NextResponse.json({ success: true, professional: updated });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json({ success: false, error: message }, { status: 400 });
	}
}

// GET /api/professionals/[id] - Detalhes de um profissional
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { id } = params;
		const professional = await prisma.professional.findUnique({ where: { id } });
		if (!professional) {
			return NextResponse.json({ success: false, error: 'Profissional não encontrado' }, { status: 404 });
		}
		return NextResponse.json({ success: true, professional });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json({ success: false, error: message }, { status: 400 });
	}
}
