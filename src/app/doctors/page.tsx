// src/app/doctors/page.tsx
import { prisma } from '@/lib/prisma';
import { DoctorCard } from '@/components/doctor-card';
import { DoctorsMap } from '@/components/doctors-map';

export const dynamic = 'force-dynamic'; // можна забрати, але не заважає
// (якщо в проєкті десь в next.config встановлений edge-runtime за замовчуванням,
// можна додати ще рядок нижче)
// export const runtime = 'nodejs';

export default async function DoctorsPage() {
  const doctors = await prisma.doctor.findMany({
    orderBy: { fullName: 'asc' },
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
        <p className="mb-4 text-sm text-muted-foreground">
          Лікарі-онкологи та патоморфологи по Україні. На карті нижче можна
          побачити їх розташування, а праворуч — детальні профілі.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="min-h-[400px]">
          <DoctorsMap doctors={mapDoctors} />
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          {doctors.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} />
          ))}
        </div>
      </div>
    </div>
  );
}
