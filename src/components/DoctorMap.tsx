// src/components/DoctorMap.tsx
"use client";

import { useEffect, useState } from "react";
import { DoctorsMap } from "@/components/doctors-map";
import { DoctorCard } from "@/components/doctor-card";

type DoctorFromApi = {
  id: string;
  fullName: string;
  lat: number | null;
  lng: number | null;
  city: string;
  region: string;
  specialization: string;
  subSpecialization?: string | null;
  clinicName?: string | null;
  description?: string | null;
  isTelepathologyAvailable: boolean;
  isAcceptingNewPatients: boolean;
  yearsOfExperience?: number | null;
  avatarUrl?: string | null;
};

export default function DoctorMap() {
  const [doctors, setDoctors] = useState<DoctorFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/doctors");
        if (!res.ok) throw new Error("Не вдалося завантажити лікарів");
        const data = await res.json();
        setDoctors(data);
      } catch (e: any) {
        setError(e.message ?? "Помилка завантаження");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="mt-4 flex h-[420px] items-center justify-center text-sm text-slate-500">
        Завантаження карти лікарів...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 flex h-[420px] items-center justify-center text-sm text-red-600">
        Помилка: {error}
      </div>
    );
  }

  if (!doctors.length) {
    return (
      <div className="mt-4 flex h-[420px] items-center justify-center text-sm text-slate-500">
        Поки немає лікарів для відображення
      </div>
    );
  }

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
    <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      {/* Ліва колонка — карта */}
      <div className="min-h-[420px]">
        <DoctorsMap doctors={mapDoctors} />
      </div>

      {/* Права колонка — список профілів */}
      <div className="grid gap-4 md:grid-cols-1">
        {doctors.map((doc) => (
          <DoctorCard key={doc.id} doctor={doc} />
        ))}
      </div>
    </div>
  );
}
