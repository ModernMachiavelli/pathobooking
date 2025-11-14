// src/components/doctors-map-shell.tsx
'use client';

import { useEffect, useState } from 'react';
import { DoctorsMap } from '@/components/doctors-map';

type DoctorForMap = {
  id: string;
  fullName: string;
  lat: number | null;
  lng: number | null;
  city: string;
  region: string;
  specialization: string;
};

export function DoctorsMapShell() {
  const [doctors, setDoctors] = useState<DoctorForMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/doctors');
        if (!res.ok) throw new Error('Не вдалося завантажити лікарів');
        const data = await res.json();

        const mapDoctors: DoctorForMap[] = data.map((doc: any) => ({
          id: doc.id,
          fullName: doc.fullName,
          lat: doc.lat,
          lng: doc.lng,
          city: doc.city,
          region: doc.region,
          specialization: doc.specialization,
        }));

        setDoctors(mapDoctors);
      } catch (e: any) {
        setError(e.message ?? 'Помилка завантаження');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Завантаження карти лікарів...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-600">
        Помилка: {error}
      </div>
    );
  }

  if (!doctors.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Поки немає лікарів для відображення
      </div>
    );
  }

  return <DoctorsMap doctors={doctors} />;
}
