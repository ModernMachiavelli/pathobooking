// src/app/api/appointment-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/appointment-requests
 *
 * Опційно:
 *  - ?doctorId=<id>     — фільтр по лікарю
 *  - ?caseId=<caseId>   — фільтр по кейсу
 *
 * Використовується для дебагу / адмінки.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const doctorId = searchParams.get("doctorId");
    const caseId = searchParams.get("caseId");

    const where: any = {};

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (caseId) {
      where.patientCaseId = caseId;
    }

    const requests = await prisma.appointmentRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        doctor: true,
        patientCase: true,
      },
      take: 100,
    });

    return NextResponse.json(requests);
  } catch (err) {
    console.error("[GET /api/appointment-requests] error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/appointment-requests
 *
 * Викликається з форми на сторінці лікаря (DoctorRequestForm).
 * Очікує в тілі JSON приблизно такого вигляду:
 *  {
 *    doctorId: string,
 *    // МОЖЕ бути або:
 *    patientCaseId?: string,
 *    // або:
 *    caseId?: string,
 *    patientEmail?: string,
 *    message: string
 *  }
 *
 * Якщо користувач залогінений як пацієнт:
 *  - додаємо patientUserId = session.user.id
 *  - якщо email у тілі не переданий, беремо session.user.email
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Некоректне тіло запиту" },
        { status: 400 },
      );
    }

    const {
      doctorId,
      patientCaseId,
      caseId,
      patientEmail,
      message,
    } = body as any;

    if (typeof doctorId !== "string" || !doctorId) {
      return NextResponse.json(
        { error: "doctorId є обовʼязковим" },
        { status: 400 },
      );
    }

    // Підтримуємо і patientCaseId, і caseId
    const resolvedCaseId: string | null =
      (typeof patientCaseId === "string" && patientCaseId) ||
      (typeof caseId === "string" && caseId) ||
      null;

    if (!resolvedCaseId) {
      return NextResponse.json(
        { error: "patientCaseId / caseId є обовʼязковим" },
        { status: 400 },
      );
    }

    const session = await getServerAuthSession();
    const userId = session?.user?.id as string | undefined;

    // email пацієнта: беремо з тіла, або, якщо не вказаний, з сесії
    const emailToSave: string | null =
      (typeof patientEmail === "string" && patientEmail) ||
      (typeof session?.user?.email === "string"
        ? session.user.email
        : null);

    if (!emailToSave) {
      return NextResponse.json(
        {
          error:
            "Не вдалося визначити email пацієнта. Вкажіть його у формі або увійдіть в акаунт.",
        },
        { status: 400 },
      );
    }

    const textMessage =
      typeof message === "string" && message.trim().length > 0
        ? message.trim()
        : "Пацієнт не залишив додаткового повідомлення.";

    const created = await prisma.appointmentRequest.create({
      data: {
        doctorId,
        patientCaseId: resolvedCaseId,
        patientEmail: emailToSave,
        message: textMessage,
        // 🔗 Привʼязка до користувача-пацієнта, якщо він залогінений
        ...(userId && { patientUserId: userId }),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("[POST /api/appointment-requests] error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}