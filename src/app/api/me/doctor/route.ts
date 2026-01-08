// src/app/api/me/doctor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Неавторизовано" }, { status: 401 });
  }

  const user = session.user as any;

  if (user.role !== "DOCTOR") {
    return NextResponse.json(
      { error: "Користувач не є лікарем" },
      { status: 403 }
    );
  }

  const doctor = await prisma.doctor.findFirst({
    where: { userId: user.id },
    select: {
      id: true,
      slug: true,
      fullName: true,
    },
  });

  if (!doctor) {
    return NextResponse.json(
      { error: "Для цього користувача не знайдено профіль лікаря" },
      { status: 404 }
    );
  }

  return NextResponse.json(doctor);
}
