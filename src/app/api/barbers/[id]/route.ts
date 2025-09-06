/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const updatedBarber = await prisma.user.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ success: true, barber: updatedBarber });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const barber = await prisma.user.findUnique({ where: { id: params.id } });
    if (!barber) {
      return NextResponse.json({ success: false, error: 'Barbeiro não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, barber });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
