import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

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
