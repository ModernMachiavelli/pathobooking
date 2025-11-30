"use client";

type DoctorLike = {
  id: string;
  fullName: string;
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

type DoctorCardProps = {
  doctor: DoctorLike;
  isRecommended?: boolean;
};

export function DoctorCard({ doctor, isRecommended }: DoctorCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* бейдж рекомендації */}
      {isRecommended && (
        <div className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
          Рекомендовано під ваш кейс
        </div>
      )}

      {/* Хедер з аватаром та ім'ям */}
      <div className="flex items-center gap-4">
        {doctor.avatarUrl && (
          <img
            src={doctor.avatarUrl}
            alt={doctor.fullName}
            className="h-16 w-16 rounded-full object-cover"
          />
        )}
        <div>
          <div className="text-lg font-semibold">{doctor.fullName}</div>
          <div className="text-sm text-slate-600">
            {doctor.specialization}
            {doctor.subSpecialization ? ` • ${doctor.subSpecialization}` : ""}
          </div>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
            <span>
              {doctor.city}, {doctor.region}
            </span>
            {doctor.clinicName && <span>• {doctor.clinicName}</span>}
          </div>
        </div>
      </div>

      {/* Опис */}
      {doctor.description && (
        <p className="text-sm text-slate-700">{doctor.description}</p>
      )}

      {/* "бейджі" стану прийому / телепатології */}
      <div className="flex flex-wrap gap-2 text-xs">
        {doctor.isTelepathologyAvailable && (
          <span className="inline-flex items-center rounded-full bg-blue-600 px-2.5 py-0.5 font-semibold text-white">
            Телепатологія
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
    </div>
  );
}