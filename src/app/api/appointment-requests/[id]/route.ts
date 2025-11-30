// src/app/api/appointment-requests/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { id: string };

export async function PATCH(
  req: Request,
  context: { params: Promise<RouteParams> }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Не вказано ідентифікатор запиту" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => null);
  const status = body?.status as AppointmentStatus | undefined;

  const allowed: AppointmentStatus[] = [
    "PENDING",
    "ACCEPTED",
    "REJECTED",
    "DONE",
  ];

  if (!status || !allowed.includes(status)) {
    return NextResponse.json(
      { error: "Невірний статус запиту" },
      { status: 400 }
    );
  }

  const existing = await prisma.appointmentRequest.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Запит не знайдено" },
      { status: 404 }
    );
  }

  const updated = await prisma.appointmentRequest.update({
    where: { id },
    data: {
      status,
    },
  });

  return NextResponse.json(
    {
      id: updated.id,
      status: updated.status,
    },
    { status: 200 }
  );
}
