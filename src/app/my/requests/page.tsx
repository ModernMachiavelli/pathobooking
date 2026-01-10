// src/app/my/requests/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/server-auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function MyRequestsPage() {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/my/requests");
  }

  const user = session.user as any;
  const userId = user.id as string;
  const role = (user.role as string | undefined) ?? "PATIENT";

  const requests = await prisma.appointmentRequest.findMany({
    where: { patientUserId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      doctor: true,
      patientCase: true,
    },
  });

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Мої запити до лікарів</h1>
        <div className="text-xs text-slate-600">
          Ви увійшли як{" "}
          <Badge variant="outline" className="align-middle">
            {role === "ADMIN"
              ? "Адмін"
              : role === "DOCTOR"
              ? "Лікар"
              : "Пацієнт"}
          </Badge>
          . Тут відображаються запити, надіслані з вашого акаунта.
        </div>
      </header>

      {requests.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
          Ви ще не надсилали запитів до лікарів.
          <div className="mt-3">
            <Link href="/">
              <Button size="sm">Створити кейс та знайти лікаря</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const created = new Date(r.createdAt).toLocaleString("uk-UA");
            const status = r.status;
            const doctorName = r.doctor?.fullName || "Невідомий лікар";
            const doctorSlug = r.doctor?.slug;
            const organ = r.patientCase?.suspectedOrgan || "не вказано";
            const caseId = r.patientCaseId;

            let statusLabel = "Очікує";
            let statusColor: "outline" | "default" = "outline";

            if (status === "ACCEPTED") {
              statusLabel = "Прийнято";
              statusColor = "default";
            } else if (status === "REJECTED") {
              statusLabel = "Відхилено";
              statusColor = "outline";
            } else if (status === "DONE") {
              statusLabel = "Завершено";
              statusColor = "default";
            }

            const hasDoctorReply = !!r.doctorReply;
            const doctorReplyDate =
              r.doctorReplyCreatedAt &&
              new Date(r.doctorReplyCreatedAt).toLocaleString("uk-UA");

            return (
              <Card key={r.id}>
                <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <CardTitle className="text-sm">
                      Запит до: {doctorName}
                    </CardTitle>
                    <CardDescription className="text-[11px]">
                      Відправлено: {created}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    <Badge variant={statusColor}>{statusLabel}</Badge>
                    <Badge variant="outline">Орган: {organ}</Badge>
                    <Badge variant="outline">
                      Кейс #{caseId.slice(0, 8)}…
                    </Badge>
                    {hasDoctorReply && (
                      <Badge variant="default">Є відповідь</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="whitespace-pre-wrap text-xs text-slate-700">
                    {r.message}
                  </p>

                  {hasDoctorReply && (
                    <div className="mt-1 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs">
                      <div className="mb-1 font-semibold text-emerald-900">
                        Відповідь лікаря
                      </div>
                      {doctorReplyDate && (
                        <div className="mb-1 text-[10px] text-emerald-800">
                          Дата відповіді: {doctorReplyDate}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap text-emerald-900">
                        {r.doctorReply}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2 text-xs">
                    <Link href={`/cases/${caseId}`}>
                      <Button variant="outline" size="sm">
                        Відкрити кейс
                      </Button>
                    </Link>

                    {doctorSlug && (
                      <Link href={`/doctors/${doctorSlug}?caseId=${caseId}`}>
                        <Button variant="outline" size="sm">
                          Перейти до профілю лікаря
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
