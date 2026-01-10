// src/app/cases/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/server-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CasePage(props: {
  params: Promise<{ id: string }>;
}) {
  // Next 16: params — це Promise
  const { id } = await props.params;

  const session = await getServerAuthSession();
  if (!session || !session.user) {
    redirect(`/login?callbackUrl=/cases/${id}`);
  }

  const user = session.user as any;
  const role = user.role as string | undefined;
  const userId = user.id as string;

  // 🔹 Адмін — може все
  if (role === "ADMIN") {
    const patientCase = await prisma.patientCase.findUnique({
      where: { id },
      include: {
        attachments: true,
        appointmentRequests: {
          include: {
            doctor: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!patientCase) {
      notFound();
    }

    return <CaseView patientCase={patientCase} role="ADMIN" />;
  }

  // 🔹 Пацієнт — тільки свої кейси (створені з його акаунта)
  if (role === "PATIENT") {
    const patientCase = await prisma.patientCase.findFirst({
      where: {
        id,
        createdByUserId: userId,
      },
      include: {
        attachments: true,
        appointmentRequests: {
          include: {
            doctor: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!patientCase) {
      // кейс або не існує, або не належить цьому пацієнту
      redirect("/");
    }

    return <CaseView patientCase={patientCase} role="PATIENT" />;
  }

  // 🔹 Лікар — тільки кейси, за якими є його запити
  if (role === "DOCTOR") {
    // шукаємо профіль лікаря за userId
    const doctor = await prisma.doctor.findFirst({
      where: { userId },
      select: { id: true, fullName: true },
    });

    if (!doctor) {
      // лікар без привʼязаного Doctor-профілю
      redirect("/");
    }

    const patientCase = await prisma.patientCase.findFirst({
      where: {
        id,
        appointmentRequests: {
          some: {
            doctorId: doctor.id,
          },
        },
      },
      include: {
        attachments: true,
        appointmentRequests: {
          include: {
            doctor: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!patientCase) {
      // немає доступу до цього кейсу
      redirect("/");
    }

    return <CaseView patientCase={patientCase} role="DOCTOR" />;
  }

  // інші ролі — поки не підтримуємо
  redirect("/");
}

// ---- Презентаційний компонент для відображення кейсу ----

type CaseRole = "ADMIN" | "PATIENT" | "DOCTOR";

type CaseWithRelations = Awaited<
  ReturnType<typeof prisma.patientCase.findUnique>
>;

function CaseView({
  patientCase,
  role,
}: {
  patientCase: NonNullable<CaseWithRelations>;
  role: CaseRole;
}) {
  const createdAt = new Date(patientCase.createdAt).toLocaleString("uk-UA");

  const attachments = patientCase.attachments ?? [];
  const requests = patientCase.appointmentRequests ?? [];

  const roleLabel =
    role === "ADMIN" ? "Адмін" : role === "DOCTOR" ? "Лікар" : "Пацієнт";

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">
          Кейс #{patientCase.id.slice(0, 8)}…
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span>Створено: {createdAt}</span>
          <Badge variant="outline">Орган: {patientCase.suspectedOrgan || "не вказано"}</Badge>
          <Badge variant="outline">
            Підозра: {patientCase.suspicionLevel || "не вказано"}
          </Badge>
          {typeof patientCase.age === "number" && (
            <Badge variant="outline">Вік: {patientCase.age}</Badge>
          )}
          {patientCase.sex && (
            <Badge variant="outline">Стать: {patientCase.sex}</Badge>
          )}
          <Badge variant="outline" className="ml-auto">
            Роль перегляду: {roleLabel}
          </Badge>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Клінічний опис</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {patientCase.mainComplaint && (
            <p>
              <span className="font-semibold text-xs">Головна скарга:</span>{" "}
              {patientCase.mainComplaint}
            </p>
          )}
          {patientCase.freeTextSummary && (
            <p className="text-xs text-slate-700 whitespace-pre-wrap">
              <span className="font-semibold">Резюме кейсу:</span>{" "}
              {patientCase.freeTextSummary}
            </p>
          )}
          {patientCase.additionalInfo && (
            <p className="text-xs text-slate-700 whitespace-pre-wrap">
              <span className="font-semibold">Додаткова інформація:</span>{" "}
              {patientCase.additionalInfo}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Файли кейсу */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Файли кейсу ({attachments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {attachments.length === 0 ? (
              <p className="text-slate-600">Файли ще не додані.</p>
            ) : (
              attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between gap-2 rounded border border-slate-200 bg-slate-50 px-2 py-1"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{att.originalName}</p>
                    <p className="truncate text-[10px] text-slate-600">
                      {att.contentType || "невідомий тип"}
                    </p>
                  </div>
                  {att.publicUrl && (
                    <Link href={att.publicUrl} target="_blank">
                      <Button size="xs" variant="outline">
                        Відкрити
                      </Button>
                    </Link>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Запити до лікарів */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Запити до лікарів ({requests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {requests.length === 0 ? (
              <p className="text-slate-600">
                Запити до лікарів ще не надсилалися.
              </p>
            ) : (
              requests.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {r.doctor?.fullName || "Невідомий лікар"}
                      </span>
                      <span className="text-[10px] text-slate-600">
                        {new Date(r.createdAt).toLocaleString("uk-UA")}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {r.status}
                    </Badge>
                  </div>
                  <p className="whitespace-pre-wrap text-[11px] text-slate-700">
                    {r.message}
                  </p>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {r.doctor?.slug && (
                      <Link href={`/doctors/${r.doctor.slug}`}>
                        <Button size="xs" variant="outline">
                          Профіль лікаря
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}