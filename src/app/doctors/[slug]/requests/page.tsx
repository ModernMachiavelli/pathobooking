// src/app/doctors/[slug]/requests/page.tsx
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/server-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DoctorRequestsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  // У Next 16 params — Promise, тому розпаковуємо його через await
  const { slug } = await props.params;

  const session = await getServerAuthSession();

  if (!session || !session.user) {
    // немає сесії → на логін, з поверненням назад в inbox
    redirect(`/login?callbackUrl=/doctors/${slug}/requests`);
  }

  const user = session.user as any;
  const role = user.role as string | undefined;

  // завантажуємо лікаря з його запитами
  const doctor = await prisma.doctor.findUnique({
    where: { slug },
    include: {
      appointmentRequests: {
        orderBy: { createdAt: "desc" },
        include: {
          patientCase: true,
        },
      },
    },
  });

  if (!doctor) {
    notFound();
  }

  const isOwnerDoctor =
    role === "DOCTOR" && doctor.userId != null && doctor.userId === user.id;

  const isAdmin = role === "ADMIN";

  if (!isAdmin && !isOwnerDoctor) {
    // не адмін і не власник → немає доступу
    redirect("/");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">
            Запити до лікаря {doctor.fullName}
          </h1>
          <p className="text-xs text-slate-600">
            Ви бачите{" "}
            {isAdmin
              ? "усі запити як адміністратор."
              : "запити, які надійшли до вашого профілю."}
          </p>
        </div>
        <Badge variant="outline">{isAdmin ? "Адмін" : "Лікар"}</Badge>
      </div>

      {doctor.appointmentRequests.length === 0 ? (
        <p className="text-sm text-slate-600">
          Запитів від пацієнтів поки немає.
        </p>
      ) : (
        <div className="space-y-3">
          {doctor.appointmentRequests.map((req) => (
            <Card key={req.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm">
                    Запит від: {req.patientEmail}
                  </CardTitle>
                  <p className="text-[11px] text-slate-500">
                    {new Date(req.createdAt).toLocaleString("uk-UA")}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {req.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="whitespace-pre-wrap">{req.message}</p>
                {req.patientCase && (
                  <div className="mt-2 text-xs text-slate-600 space-y-1">
                    <div>
                      <span className="font-semibold">Кейс:</span>{" "}
                      <Link
                        href={`/cases/${req.patientCaseId}`}
                        className="text-blue-600 underline"
                      >
                        #{req.patientCaseId.slice(0, 8)}…
                      </Link>
                    </div>
                    <div>
                      <span className="font-semibold">Орган:</span>{" "}
                      {req.patientCase.suspectedOrgan || "не вказано"}
                    </div>
                    <div>
                      <span className="font-semibold">Рівень підозри:</span>{" "}
                      {req.patientCase.suspicionLevel || "не вказано"}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
