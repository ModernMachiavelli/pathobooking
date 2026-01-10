// src/app/api/appointment-requests/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = ["PENDING", "ACCEPTED", "REJECTED", "DONE"] as const;
type Status = (typeof ALLOWED_STATUSES)[number];

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Next 16: params — це Promise
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Не передано id запиту" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Некоректне тіло запиту" },
        { status: 400 }
      );
    }

    const { status } = body as { status?: string };

    if (!status || !ALLOWED_STATUSES.includes(status as Status)) {
      return NextResponse.json(
        {
          error:
            "Поле status обовʼязкове і має бути одним з: " +
            ALLOWED_STATUSES.join(", "),
        },
        { status: 400 }
      );
    }

    const session = await getServerAuthSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Потрібна авторизація" },
        { status: 401 }
      );
    }

    const user = session.user as any;

    // Завантажуємо запит разом із лікарем, щоб перевірити права
    const existing = await prisma.appointmentRequest.findUnique({
      where: { id },
      include: {
        doctor: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Запит не знайдено" },
        { status: 404 }
      );
    }

    const isAdmin = user.role === "ADMIN";
    const isDoctorOwner =
      user.role === "DOCTOR" &&
      existing.doctor &&
      existing.doctor.userId === user.id;

    if (!isAdmin && !isDoctorOwner) {
      return NextResponse.json(
        { error: "Недостатньо прав для зміни цього запиту" },
        { status: 403 }
      );
    }

    const updated = await prisma.appointmentRequest.update({
      where: { id },
      data: {
        status: status as Status,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("[PATCH /api/appointment-requests/:id] error", err);
    const msg =
      typeof err?.message === "string"
        ? err.message
        : "Внутрішня помилка сервера";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}