// src/app/api/doctors/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const region = searchParams.get('region');
  const specialization = searchParams.get('specialization');

  const where: any = {};

  if (region) {
    where.region = region;
  }

  if (specialization) {
    where.specialization = specialization;
  }

  const doctors = await prisma.doctor.findMany({
    where,
    orderBy: { fullName: 'asc' },
  });

  return NextResponse.json(doctors);
}