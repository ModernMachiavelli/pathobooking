// src/app/api/patient-cases/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { error: "Некоректне тіло запиту" },
      { status: 400 }
    );
  }

  const {
    age,
    sex,
    suspectedOrgan,
    suspicionLevel,
    mainComplaint,
    freeTextSummary,

    // нові поля
    biopsyType,
    materialType,
    priorTreatment,
    suspectedCancerType,
    stagingInfo,
  } = body as Record<string, unknown>;

  // мінімальна валідація — можна посилити
  if (!sex && !suspectedOrgan && !mainComplaint && !freeTextSummary) {
    return NextResponse.json(
      {
        error:
          "Недостатньо даних для створення кейсу. Заповніть, будь ласка, анкету.",
      },
      { status: 400 }
    );
  }

  const normalizedAge =
    typeof age === "number"
      ? age
      : typeof age === "string" && age.trim()
      ? Number(age)
      : null;

  const patientCase = await prisma.patientCase.create({
    data: {
      age: Number.isFinite(normalizedAge as number)
        ? (normalizedAge as number)
        : null,
      sex: typeof sex === "string" ? sex : null,
      suspectedOrgan:
        typeof suspectedOrgan === "string" ? suspectedOrgan : null,
      suspicionLevel:
        typeof suspicionLevel === "string" ? suspicionLevel : null,
      mainComplaint:
        typeof mainComplaint === "string" ? mainComplaint : null,
      freeTextSummary:
        typeof freeTextSummary === "string" ? freeTextSummary : null,

      // нові клінічні поля
      biopsyType: typeof biopsyType === "string" ? biopsyType : null,
      materialType: typeof materialType === "string" ? materialType : null,
      priorTreatment:
        typeof priorTreatment === "string" ? priorTreatment : null,
      suspectedCancerType:
        typeof suspectedCancerType === "string" ? suspectedCancerType : null,
      stagingInfo: typeof stagingInfo === "string" ? stagingInfo : null,
    },
  });

  return NextResponse.json(
    {
      id: patientCase.id,
      createdAt: patientCase.createdAt,
    },
    { status: 201 }
  );
}