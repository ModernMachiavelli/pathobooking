// src/app/api/appointment-requests/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { caseId, doctorId, patientEmail, message } = body ?? {};

    if (!caseId || !doctorId) {
      return NextResponse.json(
        { error: "Необхідні caseId та doctorId" },
        { status: 400 }
      );
    }

    // (Необов'язково, але акуратно) — можна перевірити, що кейс і лікар існують
    const [patientCase, doctor] = await Promise.all([
      prisma.patientCase.findUnique({ where: { id: caseId } }),
      prisma.doctor.findUnique({ where: { id: doctorId } }),
    ]);

    if (!patientCase || !doctor) {
      return NextResponse.json(
        { error: "Пацієнтський кейс або лікар не знайдені" },
        { status: 404 }
      );
    }

    const appointment = await prisma.appointmentRequest.create({
      data: {
        patientCaseId: caseId,
        doctorId,
        patientEmail: typeof patientEmail === "string" ? patientEmail : null,
        message: typeof message === "string" ? message : null,
      },
    });

    return NextResponse.json(
      {
        id: appointment.id,
        status: appointment.status,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("[POST /api/appointment-requests] error:", e);
    return NextResponse.json(
      { error: "Не вдалося створити запит до лікаря" },
      { status: 500 }
    );
  }
}
