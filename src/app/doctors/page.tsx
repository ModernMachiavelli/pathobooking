import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DoctorCard } from "@/components/doctor-card";
import { DoctorsMap } from "@/components/doctors-map";

export const dynamic = "force-dynamic";

export default async function DoctorsPage() {
  const doctors = await prisma.doctor.findMany({
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

  return (
    <div className="container mx-auto max-w-6xl py-8 space-y-6">
      {/* Лінк назад на головну */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Профілі лікарів</h1>
        <Link
          href="/"
          className="text-sm text-blue-600 underline underline-offset-4"
        >
          ← На головну
        </Link>
      </div>

      <p className="mb-2 text-sm text-slate-600">
        Лікарі-онкологи та патоморфологи по Україні. Оберіть лікаря, який має
        досвід з подібними кейсами.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="min-h-[420px]">
          <DoctorsMap doctors={mapDoctors} />
        </div>

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
