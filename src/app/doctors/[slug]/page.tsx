import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DoctorsMap } from "@/components/doctors-map";
import Link from "next/link";

type DoctorPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";
// export const runtime = "nodejs"; // якщо в проекті глобально edge

export default async function DoctorPage({ params }: DoctorPageProps) {
  // У Next 16 params — це Promise, тому спочатку чекаємо
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const doctor = await prisma.doctor.findFirst({
    where: { slug },
  });

  if (!doctor) {
    notFound();
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
      <Link
        href="/doctors"
        className="text-sm text-blue-600 underline underline-offset-4"
      >
        ← Назад до списку лікарів
      </Link>

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
