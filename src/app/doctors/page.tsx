// src/app/doctors/page.tsx
import { prisma } from '@/lib/prisma';
import { DoctorCard } from '@/components/doctor-card';

export const dynamic = 'force-dynamic'; // щоб завжди брати свіжі дані (опційно)

export default async function DoctorsPage() {
  const doctors = await prisma.doctor.findMany({
    orderBy: { fullName: 'asc' },
  });

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <h1 className="mb-2 text-2xl font-semibold">Профілі лікарів</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Тут пацієнти зможуть обрати лікаря, який має досвід роботи з подібними
        діагнозами. Далі ми прив’яжемо це до анкети та карти України.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {doctors.map((doc) => (
          <DoctorCard key={doc.id} doctor={doc} />
        ))}
      </div>
    </div>
  );
}
