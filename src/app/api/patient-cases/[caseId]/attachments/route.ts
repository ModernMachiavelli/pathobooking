// src/app/api/patient-cases/[caseId]/attachments/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { caseId: string };

export async function POST(
  req: Request,
  context: { params: Promise<RouteParams> }
) {
  const { caseId } = await context.params; // ✅ очікуємо Promise

  if (!caseId) {
    return NextResponse.json(
      { error: "Не вказано ідентифікатор кейсу" },
      { status: 400 }
    );
  }

  const patientCase = await prisma.patientCase.findUnique({
    where: { id: caseId },
  });

  if (!patientCase) {
    return NextResponse.json(
      { error: "Кейс пацієнта не знайдено" },
      { status: 404 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const type = (formData.get("type") as string | null) ?? "other";

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Не передано файл" },
      { status: 400 }
    );
  }

  const bucket =
    process.env.SUPABASE_PATIENT_FILES_BUCKET ?? "patient-files";

  const fileExt = (file.name.split(".").pop() ?? "").toLowerCase();
  const key = `${caseId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}${fileExt ? "." + fileExt : ""}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(key, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error || !data) {
    console.error("[upload attachment] supabase error:", error);
    return NextResponse.json(
      { error: "Не вдалося завантажити файл у storage" },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);

  const attachment = await prisma.attachment.create({
    data: {
      patientCaseId: caseId,
      type,
      url: publicUrl,
      filename: file.name,
      size: file.size,
      contentType: file.type || null,
    },
  });

  return NextResponse.json(
    {
      id: attachment.id,
      filename: attachment.filename,
      url: attachment.url,
      type: attachment.type,
      createdAt: attachment.createdAt,
    },
    { status: 201 }
  );
}

export async function GET(
  _req: Request,
  context: { params: Promise<RouteParams> }
) {
  const { caseId } = await context.params; // ✅ теж await

  const attachments = await prisma.attachment.findMany({
    where: { patientCaseId: caseId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    attachments.map((a) => ({
      id: a.id,
      filename: a.filename,
      url: a.url,
      type: a.type,
      createdAt: a.createdAt,
    }))
  );
}
