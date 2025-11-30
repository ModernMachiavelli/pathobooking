// src/app/api/patient-cases/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Дуже простий валідатор. Потім можна підключити zod.
    const {
      age,
      sex,
      suspectedOrgan,
      suspicionLevel,
      mainComplaint,
      freeTextSummary,
    } = body ?? {};

    const patientCase = await prisma.patientCase.create({
      data: {
        age: typeof age === "number" ? age : null,
        sex: typeof sex === "string" ? sex : null,
        suspectedOrgan:
          typeof suspectedOrgan === "string" ? suspectedOrgan : null,
        suspicionLevel:
          typeof suspicionLevel === "string" ? suspicionLevel : null,
        mainComplaint:
          typeof mainComplaint === "string" ? mainComplaint : null,
        freeTextSummary:
          typeof freeTextSummary === "string" ? freeTextSummary : null,
      },
    });

    return NextResponse.json(
      { id: patientCase.id },
      { status: 201 }
    );
  } catch (e) {
    console.error("[POST /api/patient-cases] error:", e);
    return NextResponse.json(
      { error: "Не вдалося створити кейс пацієнта" },
      { status: 500 }
    );
  }
}
