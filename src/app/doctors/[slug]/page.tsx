// src/app/doctors/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DoctorsMap } from "@/components/doctors-map";
import Link from "next/link";
import type { PatientCase, Attachment } from "@prisma/client";
import { DoctorRequestForm } from "@/components/DoctorRequestForm";

type DoctorPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ caseId?: string }>;
};

export const dynamic = "force-dynamic";

export default async function DoctorPage({
  params,
  searchParams,
}: DoctorPageProps) {
  const { slug } = await params;
  const { caseId } = await searchParams;

  if (!slug) {
    notFound();
  }

  const doctor = await prisma.doctor.findFirst({
    where: { slug },
  });

  if (!doctor) {
    notFound();
  }

  // Кейс + вкладення, якщо прийшли з caseId
  let matchedCase: (PatientCase & { attachments: Attachment[] }) | null = null;

  if (caseId) {
    matchedCase = await prisma.patientCase.findUnique({
      where: { id: caseId },
      include: { attachments: true },
    });
  }

  const mapDoctors =
    typeof doctor.lat === "number" && typeof doctor.lng === "number"
      ? [
          {
            id: doctor.id,
            fullName: doctor.fullName,
            lat: doctor.lat,
            lng: doctor.lng,
            city: doctor.city,
            region: doctor.region,
            specialization: doctor.specialization,
          },
        ]
      : [];

  const shortCaseId =
    matchedCase?.id ? matchedCase.id.slice(-6).toUpperCase() : null;

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-6">
      {/* Верхня панель навігації + debug-кнопка */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href={caseId ? `/doctors?caseId=${caseId}` : "/doctors"}
          className="text-sm text-blue-600 underline underline-offset-4"
        >
          ← Назад до списку лікарів
        </Link>

        <div className="flex items-center gap-3">
          {/* Невелике debug-посилання в inbox */}
          <Link
            href={`/doctors/${doctor.slug}/requests`}
            className="text-[11px] text-slate-500 underline underline-offset-4"
          >
            📥 Вхідні запити (debug)
          </Link>

          <Link
            href="/"
            className="text-xs text-slate-500 underline underline-offset-4"
          >
            На головну
          </Link>
        </div>
      </div>

      {/* Верхній блок: аватар + основна інформація */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {doctor.avatarUrl && (
          <img
            src={doctor.avatarUrl}
            alt={doctor.fullName}
            className="h-32 w-32 rounded-full object-cover border border-slate-200"
          />
        )}

        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-semibold">{doctor.fullName}</h1>

          <div className="text-sm text-slate-600">
            {doctor.specialization}
            {doctor.subSpecialization ? ` • ${doctor.subSpecialization}` : ""}
          </div>

          <div className="text-sm text-slate-600">
            {doctor.city}, {doctor.region}
            {doctor.clinicName ? ` • ${doctor.clinicName}` : ""}
          </div>

          <div className="flex flex-wrap gap-2 text-xs mt-2">
            {doctor.isTelepathologyAvailable && (
              <span className="inline-flex items-center rounded-full bg-blue-600 px-2.5 py-0.5 font-semibold text-white">
                Доступна телепатологія
              </span>
            )}

            <span className="inline-flex items-center rounded-full border border-slate-300 px-2.5 py-0.5 font-semibold text-slate-800">
              {doctor.isAcceptingNewPatients
                ? "Приймає нових пацієнтів"
                : "Тимчасово без запису"}
            </span>

            {doctor.yearsOfExperience != null && (
              <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 font-semibold text-slate-900">
                Досвід {doctor.yearsOfExperience}+ років
              </span>
            )}
          </div>

          {doctor.email && (
            <div className="text-sm text-slate-700 mt-2">
              Email:{" "}
              <a
                href={`mailto:${doctor.email}`}
                className="text-blue-600 underline underline-offset-4"
              >
                {doctor.email}
              </a>
            </div>
          )}

          {doctor.phone && (
            <div className="text-sm text-slate-700">
              Телефон:{" "}
              <a
                href={`tel:${doctor.phone}`}
                className="text-blue-600 underline underline-offset-4"
              >
                {doctor.phone}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Опис лікаря */}
      {doctor.description && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Про лікаря</h2>
          <p className="text-sm text-slate-700 whitespace-pre-line">
            {doctor.description}
          </p>
        </section>
      )}

      {/* Блок "Про цей кейс" + файли, якщо є caseId */}
      {matchedCase && (
        <section className="space-y-4">
          {/* Короткий опис кейсу */}
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Про цей кейс</h2>
              <div className="flex items-center gap-2">
                {shortCaseId && (
                  <span className="text-[11px] font-mono text-slate-500">
                    ID кейсу: #{shortCaseId}
                  </span>
                )}
                <Link
                  href={`/cases/${matchedCase.id}`}
                  className="text-[11px] text-blue-700 underline underline-offset-4"
                >
                  🔍 Відкрити повністю
                </Link>
              </div>
            </div>

            <div className="grid gap-2 text-sm md:grid-cols-2">
              <div>
                <span className="font-medium">Підозрюваний орган: </span>
                <span>{matchedCase.suspectedOrgan || "не вказано"}</span>
              </div>
              <div>
                <span className="font-medium">Рівень підозри: </span>
                <span>{matchedCase.suspicionLevel || "не вказано"}</span>
              </div>
              <div>
                <span className="font-medium">Вік: </span>
                <span>
                  {matchedCase.age != null ? matchedCase.age : "не вказано"}
                </span>
              </div>
              <div>
                <span className="font-medium">Стать: </span>
                <span>{matchedCase.sex || "не вказано"}</span>
              </div>

              {/* клінічні поля */}
              <div>
                <span className="font-medium">Тип біопсії: </span>
                <span>{matchedCase.biopsyType || "не вказано"}</span>
              </div>
              <div>
                <span className="font-medium">Тип матеріалу: </span>
                <span>{matchedCase.materialType || "не вказано"}</span>
              </div>
              <div>
                <span className="font-medium">Попереднє лікування: </span>
                <span>{matchedCase.priorTreatment || "не вказано"}</span>
              </div>
              <div>
                <span className="font-medium">Стадія / TNM / ризик: </span>
                <span>{matchedCase.stagingInfo || "не вказано"}</span>
              </div>

              <div className="md:col-span-2">
                <span className="font-medium">Підозрюваний тип пухлини: </span>
                <span>{matchedCase.suspectedCancerType || "не вказано"}</span>
              </div>
            </div>

            {matchedCase.mainComplaint && (
              <div className="text-sm">
                <div className="font-medium mb-1">Основна скарга:</div>
                <p className="text-slate-700 whitespace-pre-line">
                  {matchedCase.mainComplaint}
                </p>
              </div>
            )}

            {matchedCase.freeTextSummary && (
              <div className="text-sm">
                <div className="font-medium mb-1">
                  Додатковий опис / контекст:
                </div>
                <p className="text-slate-700 whitespace-pre-line">
                  {matchedCase.freeTextSummary}
                </p>
              </div>
            )}
          </div>

          {/* Файли цього кейсу (короткий список) */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Файли цього кейсу</h3>

            {matchedCase.attachments.length === 0 ? (
              <p className="text-xs text-slate-500">
                До цього кейсу ще не додано жодного файлу. Пацієнт може додати
                їх на сторінці підбору лікарів.
              </p>
            ) : (
              <ul className="space-y-1 text-xs">
                {matchedCase.attachments.map((a) => {
                  const created = a.createdAt.toLocaleString("uk-UA", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const isImage = a.contentType?.startsWith("image/");

                  return (
                    <li
                      key={a.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5"
                    >
                      <div className="flex flex-col">
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-700 underline underline-offset-4"
                        >
                          {a.filename}
                        </a>
                        <span className="text-[10px] text-slate-500">
                          Тип: {a.type} • Додано: {created}
                        </span>
                      </div>

                      {isImage && (
                        <img
                          src={a.url}
                          alt={a.filename}
                          className="h-10 w-10 rounded-md object-cover border border-slate-200"
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Форма запиту, якщо є кейс */}
      {matchedCase ? (
        <section className="space-y-2">
          <DoctorRequestForm
            doctorId={doctor.id}
            caseId={matchedCase.id}
            suspectedOrgan={matchedCase.suspectedOrgan ?? null}
            suspicionLevel={matchedCase.suspicionLevel ?? null}
          />
        </section>
      ) : (
        <section className="space-y-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
            Щоб надіслати кейс цьому лікарю, спочатку заповніть анкету на
            головній сторінці. Після цього оберіть лікаря зі списку, і ми
            автоматично підв&apos;яжемо ваш кейс до запиту.
          </div>
        </section>
      )}

      {/* Карта з одним маркером */}
      {mapDoctors.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Розташування</h2>
          <div className="h-[320px]">
            <DoctorsMap doctors={mapDoctors} />
          </div>
        </section>
      )}
    </div>
  );
}
