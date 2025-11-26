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
      <div>
        <h1 className="mb-2 text-2xl font-semibold">Профілі лікарів</h1>
        <p className="mb-4 text-sm text-slate-600">
          Лікарі-онкологи та патоморфологи по Україні. Обери лікаря, який має
          досвід з подібними кейсами.
        </p>
      </div>

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
