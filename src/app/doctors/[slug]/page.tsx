// src/app/doctors/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DoctorsMap } from "@/components/doctors-map";
import Link from "next/link";
import type { PatientCase } from "@prisma/client";
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

  let matchedCase: PatientCase | null = null;

  if (caseId) {
    matchedCase = await prisma.patientCase.findUnique({
      where: { id: caseId },
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

      {/* Опис */}
      {doctor.description && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Про лікаря</h2>
          <p className="text-sm text-slate-700 whitespace-pre-line">
            {doctor.description}
          </p>
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
