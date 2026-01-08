// src/app/admin/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/server-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/admin");
  }

  const user = session.user as any;
  const role = user.role as string | undefined;

  if (role !== "ADMIN") {
    // можна зробити окрему 403-сторінку, але поки просто редірект
    redirect("/");
  }

  // --- Загальна статистика ---
  const [totalUsers, totalDoctors, totalCases, totalRequests] =
    await Promise.all([
      prisma.user.count(),
      prisma.doctor.count(),
      prisma.patientCase.count(),
      prisma.appointmentRequest.count(),
    ]);

  // --- Останні кейси / запити / лікарі ---
  const [recentCases, recentRequests, recentDoctors] = await Promise.all([
    prisma.patientCase.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        appointmentRequests: true,
      },
    }),
    prisma.appointmentRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        doctor: true,
        patientCase: true,
      },
    }),
    prisma.doctor.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-xl font-semibold">Адмінський дашборд</h1>
          <div className="text-xs text-slate-600">
            Ви увійшли як{" "}
            <Badge variant="outline" className="align-middle">
              Адмін
            </Badge>
            . Тут зібрано огляд користувачів, лікарів, кейсів та запитів.
          </div>
        </header>

      {/* Загальні метрики */}
      <section className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Користувачі</CardTitle>
            <CardDescription className="text-[11px]">
              Усі типи акаунтів
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Лікарі</CardTitle>
            <CardDescription className="text-[11px]">
              Активні профілі лікарів
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalDoctors}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Кейси</CardTitle>
            <CardDescription className="text-[11px]">
              Створені пацієнтами кейси
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalCases}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Запити</CardTitle>
            <CardDescription className="text-[11px]">
              Запити пацієнтів до лікарів
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalRequests}</p>
          </CardContent>
        </Card>
      </section>

      {/* Останні кейси */}
      <section className="grid gap-3 md:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-sm">Останні кейси</CardTitle>
            <CardDescription className="text-[11px]">
              5 останніх кейсів, створених пацієнтами
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {recentCases.length === 0 ? (
              <p className="text-slate-600">Кейсів поки немає.</p>
            ) : (
              recentCases.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start justify-between gap-2 rounded border border-slate-200 bg-slate-50 px-2 py-1.5"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        #{c.id.slice(0, 8)}…
                      </span>
                      <Badge variant="outline">
                        {c.suspectedOrgan || "орган не вказано"}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Підозра: {c.suspicionLevel || "не вказано"} · Запитів:{" "}
                      {c.appointmentRequests.length}
                    </div>
                  </div>
                  <Link href={`/cases/${c.id}`}>
                    <Button size="xs" variant="outline">
                      Відкрити
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Останні запити */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-sm">Останні запити</CardTitle>
            <CardDescription className="text-[11px]">
              5 останніх запитів до лікарів
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {recentRequests.length === 0 ? (
              <p className="text-slate-600">Запитів поки немає.</p>
            ) : (
              recentRequests.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {r.doctor?.fullName || "Невідомий лікар"}
                      </span>
                      <span className="text-[11px] text-slate-600">
                        Кейс #{r.patientCaseId.slice(0, 8)}…
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {r.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                    <span>Email пацієнта: {r.patientEmail}</span>
                    <Link href={`/cases/${r.patientCaseId}`}>
                      <Button size="xs" variant="outline">
                        Кейс
                      </Button>
                    </Link>
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
      </section>

      {/* Останні лікарі */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Останні лікарі</CardTitle>
            <CardDescription className="text-[11px]">
              5 останніх доданих профілів лікарів
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {recentDoctors.length === 0 ? (
              <p className="text-slate-600">Лікарів поки немає.</p>
            ) : (
              recentDoctors.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-2 rounded border border-slate-200 bg-slate-50 px-2 py-1.5"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{d.fullName}</span>
                      <Badge variant="outline">
                        {d.city}, {d.region}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {d.specialization}
                      {d.subSpecialization
                        ? ` · ${d.subSpecialization}`
                        : ""}
                    </div>
                  </div>
                  <Link href={`/doctors/${d.slug}`}>
                    <Button size="xs" variant="outline">
                      Профіль
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
