// src/app/api/patient-cases/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Створення нового кейсу пацієнта.
 * Викликається з анкети на головній сторінці.
 *
 * Якщо користувач залогінений — кейс прив’язується до нього через createdByUserId.
 * Якщо ні — createdByUserId залишається null (анонімний кейс).
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object") {
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
    biopsyType,
    materialType,
    priorTreatment,
    suspectedCancerType,
    stagingInfo,
  } = body as any;

  // Мінімальна перевірка ключових полів
  if (typeof age !== "number" || Number.isNaN(age)) {
    return NextResponse.json(
      { error: "Поле age має бути числом" },
      { status: 400 }
    );
  }

  if (typeof sex !== "string" || !sex) {
    return NextResponse.json(
      { error: "Поле sex має бути рядком" },
      { status: 400 }
    );
  }

  if (typeof suspectedOrgan !== "string" || !suspectedOrgan) {
    return NextResponse.json(
      { error: "Поле suspectedOrgan має бути рядком" },
      { status: 400 }
    );
  }

  if (typeof suspicionLevel !== "string" || !suspicionLevel) {
    return NextResponse.json(
      { error: "Поле suspicionLevel має бути рядком" },
      { status: 400 }
    );
  }

  // Отримуємо сесію (якщо користувач залогінений)
  const session = await getServerAuthSession();
  const userId = session?.user?.id as string | undefined;

  const patientCase = await prisma.patientCase.create({
    data: {
      age,
      sex,
      suspectedOrgan,
      suspicionLevel,
      mainComplaint:
        typeof mainComplaint === "string" ? mainComplaint : null,
      freeTextSummary:
        typeof freeTextSummary === "string" ? freeTextSummary : null,

      biopsyType: typeof biopsyType === "string" ? biopsyType : null,
      materialType:
        typeof materialType === "string" ? materialType : null,
      priorTreatment:
        typeof priorTreatment === "string" ? priorTreatment : null,
      suspectedCancerType:
        typeof suspectedCancerType === "string"
          ? suspectedCancerType
          : null,
      stagingInfo:
        typeof stagingInfo === "string" ? stagingInfo : null,

      // 🔗 Прив’язка до користувача, якщо він залогінений
      ...(userId && { createdByUserId: userId }),
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