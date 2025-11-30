import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Doctor, PatientCase } from "@prisma/client";
import { DoctorCard } from "@/components/doctor-card";
import { DoctorsMap } from "@/components/doctors-map";

export const dynamic = "force-dynamic";

type DoctorsPageProps = {
  searchParams: Promise<{ caseId?: string }>;
};

export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
  // Next 16: спочатку чекаємо searchParams
  const { caseId } = await searchParams;

  let matchedCase: PatientCase | null = null;

  if (caseId) {
    matchedCase = await prisma.patientCase.findUnique({
      where: { id: caseId },
    });
  }

  const doctors: Doctor[] = await prisma.doctor.findMany({
    orderBy: { fullName: "asc" },
  });

  const mapDoctors = doctors.map((doc) => ({
    id: doc.id,
    fullName: doc.fullName,
    lat: doc.lat,
    lng: doc.lng,
    city: doc.city,
    region: doc.region,
    specialization: doc.specialization,
  }));

  // красивий короткий номер кейсу (останні 6 символів id)
  const shortCaseId =
    matchedCase?.id ? matchedCase.id.slice(-6).toUpperCase() : null;

  return (
    <div className="container mx-auto max-w-6xl py-8 space-y-6">
      {/* заголовок + лінк на головну */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Профілі лікарів</h1>
        <Link
          href="/"
          className="text-sm text-blue-600 underline underline-offset-4"
        >
          ← На головну
        </Link>
      </div>

      {/* банер, якщо прийшли з анкети з caseId */}
      {matchedCase && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-medium">
              Ми підібрали лікарів для вашого кейсу
              {shortCaseId ? ` #${shortCaseId}` : ""}.
            </div>
            <div className="text-xs mt-0.5">
              {matchedCase.suspectedOrgan ? (
                <>
                  Підозрюваний орган:{" "}
                  <span className="font-semibold">
                    {matchedCase.suspectedOrgan}
                  </span>
                </>
              ) : (
                "Орган не вказаний в анкеті."
              )}
            </div>
          </div>

          <Link
            href="/"
            className="mt-2 md:mt-0 text-xs font-medium text-blue-700 underline underline-offset-4"
          >
            Змінити відповіді анкети
          </Link>
        </div>
      )}

      {!matchedCase && (
        <p className="mb-2 text-sm text-slate-600">
          Лікарі-онкологи та патоморфологи по Україні. Ви можете спочатку
          заповнити анкету на головній сторінці, щоб ми краще підібрали лікарів
          під вашу ситуацію.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Карта */}
        <div className="min-h-[420px]">
          <DoctorsMap doctors={mapDoctors} />
        </div>

        {/* Список карток */}
        <div className="grid gap-4 md:grid-cols-1">
          {doctors.map((doc) => (
            <Link key={doc.id} href={`/doctors/${doc.slug}`} className="block">
              <DoctorCard doctor={doc} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
