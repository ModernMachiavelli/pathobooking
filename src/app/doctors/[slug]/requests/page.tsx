// src/app/doctors/[slug]/requests/page.tsx
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/server-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RequestStatusActions from "@/components/RequestStatusActions";
import DoctorReplyEditor from "@/components/DoctorReplyEditor";

export const dynamic = "force-dynamic";

export default async function DoctorRequestsPage({
  params,
}: {
  params: any; // у Next 16 params насправді thenable, не морочимось з типами
}) {
  // важливо: params тепер треба 'await'
  const { slug } = await params;

  const session = await getServerAuthSession();

  if (!session || !session.user) {
    redirect(`/login?callbackUrl=/doctors/${slug}/requests`);
  }

  const user = session.user as any;
  const role = user.role as string | undefined;

  // базова інформація про лікаря
  const doctorBase = await prisma.doctor.findUnique({
    where: { slug },
    select: {
      id: true,
      fullName: true,
      userId: true,
    },
  });

  if (!doctorBase) {
    notFound();
  }

  const isOwnerDoctor =
    role === "DOCTOR" &&
    doctorBase.userId != null &&
    doctorBase.userId === user.id;

  const isAdmin = role === "ADMIN";

  if (!isAdmin && !isOwnerDoctor) {
    redirect("/");
  }

  // вантажимо лікаря з усіма запитами
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorBase.id },
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

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">
            Запити до лікаря {doctor.fullName}
          </h1>
          <div className="text-xs text-slate-600">
            Ви бачите{" "}
            {isAdmin
              ? "усі запити як адміністратор."
              : "запити, які надійшли до вашого профілю."}
          </div>
        </div>
        <Badge variant="outline">{isAdmin ? "Адмін" : "Лікар"}</Badge>
      </div>

      {doctor.appointmentRequests.length === 0 ? (
        <p className="text-sm text-slate-600">
          Запитів від пацієнтів поки немає.
        </p>
      ) : (
        <div className="space-y-3">
          {doctor.appointmentRequests.map((req) => {
            const isNew = req.status === "PENDING";

            return (
              <Card
                key={req.id}
                className={isNew ? "border-emerald-500 bg-emerald-50/40" : ""}
              >
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm">
                      Запит від: {req.patientEmail}
                    </CardTitle>
                    <p className="text-[11px] text-slate-500">
                      {new Date(req.createdAt).toLocaleString("uk-UA")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isNew && (
                      <Badge variant="default" className="text-[10px]">
                        NEW
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {req.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
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

                  <RequestStatusActions
                    requestId={req.id}
                    currentStatus={req.status as any}
                  />

                  {/* 🔽 блок для відповіді лікаря */}
                  <DoctorReplyEditor
                    requestId={req.id}
                    initialReply={req.doctorReply as string | null}
                    repliedAt={
                      req.doctorReplyCreatedAt
                        ? (req.doctorReplyCreatedAt as any as string)
                        : null
                    }
                  />
                </CardContent>

              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}