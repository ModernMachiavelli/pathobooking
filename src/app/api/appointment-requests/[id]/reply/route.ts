// src/app/api/appointment-requests/[id]/reply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
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

    const doctorReply = (body as any).doctorReply as string | undefined;

    if (!doctorReply || doctorReply.trim().length < 5) {
      return NextResponse.json(
        {
          error:
            "Текст відповіді лікаря є обовʼязковим і має містити хоча б кілька слів.",
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

    // тягнемо запит з привʼязаним лікарем
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
        { error: "Недостатньо прав, щоб залишити відповідь по цьому запиту" },
        { status: 403 }
      );
    }

    const updated = await prisma.appointmentRequest.update({
      where: { id },
      data: {
        doctorReply: doctorReply.trim(),
        doctorReplyCreatedAt: new Date(),
        // статус поки НЕ чіпаємо – лікар керує ним окремо кнопками
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("[POST /api/appointment-requests/:id/reply] error", err);
    const msg =
      typeof err?.message === "string"
        ? err.message
        : "Внутрішня помилка сервера";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
