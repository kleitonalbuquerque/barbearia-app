/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperadmin } from '../utils';


export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperadmin(request);
  if (auth) return auth;
  try {
    const { id } = await params;
    const data = await request.json();
    const updatedBarber = await prisma.barber.update({
      where: { id },
      data,
    });
    return NextResponse.json({ success: true, barber: updatedBarber });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperadmin(request);
  if (auth) return auth;
  try {
    const { id } = await params;
    await prisma.barber.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const barber = await prisma.barber.findUnique({ where: { id } });
    if (!barber) {
      return NextResponse.json({ success: false, error: 'Barbeiro não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, barber });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
