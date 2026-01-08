// src/app/my/cases/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/server-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function MyCasesPage() {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/my/cases");
  }

  const user = session.user as any;
  const userId = user.id as string;

  const cases = await prisma.patientCase.findMany({
    where: { createdByUserId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      attachments: true,
      appointmentRequests: {
        include: {
          doctor: true,
        },
      },
    },
  });

  const role = (user.role as string | undefined) ?? "PATIENT";

  return (
    <div className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-xl font-semibold">Мої кейси</h1>
          <div className="text-xs text-slate-600">
            Ви увійшли як{" "}
            <Badge variant="outline" className="align-middle">
              {role === "ADMIN"
                ? "Адмін"
                : role === "DOCTOR"
                ? "Лікар"
                : "Пацієнт"}
            </Badge>
            . Тут відображаються кейси, створені саме з вашого акаунта.
          </div>
        </header>

      {cases.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
          У вас поки немає жодного кейсу.
          <div className="mt-3">
            <Link href="/">
              <Button size="sm">Створити перший кейс через анкету</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => {
            const created = new Date(c.createdAt).toLocaleString("uk-UA");
            const attachmentsCount = c.attachments.length;
            const reqCount = c.appointmentRequests.length;

            const doctorsNames = Array.from(
              new Set(
                c.appointmentRequests
                  .map((r) => r.doctor?.fullName)
                  .filter(Boolean) as string[]
              )
            );

            return (
              <Card key={c.id}>
                <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <CardTitle className="text-sm">
                      Кейс #{c.id.slice(0, 8)}…
                    </CardTitle>
                    <CardDescription className="text-[11px]">
                      Створено: {created}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    <Badge variant="outline">
                      Орган: {c.suspectedOrgan || "не вказано"}
                    </Badge>
                    <Badge variant="outline">
                      Підозра: {c.suspicionLevel || "не вказано"}
                    </Badge>
                    {typeof c.age === "number" && (
                      <Badge variant="outline">Вік: {c.age}</Badge>
                    )}
                    {c.sex && <Badge variant="outline">Стать: {c.sex}</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {c.mainComplaint && (
                    <p>
                      <span className="font-semibold text-xs">
                        Головна скарга:
                      </span>{" "}
                      {c.mainComplaint}
                    </p>
                  )}

                  {c.freeTextSummary && (
                    <p className="text-xs text-slate-700">
                      <span className="font-semibold">Короткий опис:</span>{" "}
                      {c.freeTextSummary}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                    <span>
                      Файлів кейсу:{" "}
                      <span className="font-semibold">
                        {attachmentsCount}
                      </span>
                    </span>
                    <span>
                      Надіслано запитів:{" "}
                      <span className="font-semibold">{reqCount}</span>
                    </span>
                    {doctorsNames.length > 0 && (
                      <span>
                        Лікарі:{" "}
                        <span className="font-semibold">
                          {doctorsNames.join(", ")}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Link href={`/cases/${c.id}`}>
                      <Button variant="outline" size="sm">
                        Відкрити кейс
                      </Button>
                    </Link>

                    <Link href={`/doctors?caseId=${c.id}`}>
                      <Button variant="outline" size="sm">
                        Підібрати лікаря для цього кейсу
                      </Button>
                    </Link>
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