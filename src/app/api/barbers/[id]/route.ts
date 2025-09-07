/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireSuperadmin } from '../utils';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSuperadmin(request);
  if (auth) return auth;
  try {
    const data = await request.json();
    const updatedBarber = await prisma.barber.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ success: true, barber: updatedBarber });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireSuperadmin(request);
  if (auth) return auth;
  try {
    await prisma.barber.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
  const barber = await prisma.barber.findUnique({ where: { id: params.id } });
    if (!barber) {
      return NextResponse.json({ success: false, error: 'Barbeiro não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, barber });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
