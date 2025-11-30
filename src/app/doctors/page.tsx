// src/app/doctors/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Doctor, PatientCase, Attachment } from "@prisma/client";
import { DoctorCard } from "@/components/doctor-card";
import { DoctorsMap } from "@/components/doctors-map";
import { CaseAttachmentsUploader } from "@/components/CaseAttachmentsUploader";

export const dynamic = "force-dynamic";

type DoctorsPageProps = {
  searchParams: Promise<{ caseId?: string; organ?: string }>;
};

export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
  const { caseId, organ: organParam } = await searchParams;

  // ---- завантажуємо кейс разом із вкладеннями (якщо є caseId) ----
  let matchedCase: (PatientCase & { attachments: Attachment[] }) | null = null;

  if (caseId) {
    matchedCase = await prisma.patientCase.findUnique({
      where: { id: caseId },
      include: { attachments: true },
    });
  }

  const doctors: Doctor[] = await prisma.doctor.findMany({
    orderBy: { fullName: "asc" },
  });

  const shortCaseId =
    matchedCase?.id ? matchedCase.id.slice(-6).toUpperCase() : null;

  const organFromCase = matchedCase?.suspectedOrgan
    ? matchedCase.suspectedOrgan.toLowerCase()
    : null;

  // ---- підготовка вкладень для клієнтського компонента ----
  const attachmentSummaries =
    matchedCase?.attachments.map((a) => ({
      id: a.id,
      filename: a.filename,
      url: a.url,
      type: a.type,
      createdAt: a.createdAt.toISOString(),
    })) ?? [];

  // 🔹 Варіанти органів: value — ключ у URL, keywords — корені/синоніми
  const organOptions: {
    label: string;
    value: string | null;
    keywords: string[];
  }[] = [
    {
      label: "Усі органи",
      value: null,
      keywords: [],
    },
    {
      label: "Молочна залоза",
      value: "breast",
      keywords: ["молочн", "груд", "breast"],
    },
    {
      label: "Передміхурова залоза",
      value: "prostate",
      keywords: ["передміхур", "простата", "prostat"],
    },
    {
      label: "Легені",
      value: "lung",
      keywords: ["леген", "lung", "pulmon"],
    },
    {
      label: "Шкіра",
      value: "skin",
      keywords: ["шкір", "дермат", "skin"],
    },
  ];

  const selectedOrganKey = organParam ?? null;
  const selectedOrganOption = organOptions.find(
    (opt) => opt.value === selectedOrganKey
  );

  // 🧪 Фільтрація лікарів по органу (якщо обрано)
  const filteredDoctors = doctors.filter((doc) => {
    if (!selectedOrganOption || selectedOrganOption.keywords.length === 0) {
      return true; // немає фільтра → всі
    }

    const haystack =
      (
        (doc.specialization ?? "") +
        " " +
        (doc.subSpecialization ?? "") +
        " " +
        (doc.description ?? "")
      ).toLowerCase();

    return selectedOrganOption.keywords.some((kw) => haystack.includes(kw));
  });

  // 🔹 Matching для "Рекомендовано під ваш кейс" (по органу з анкети + телепатологія)
  const scoredDoctors = filteredDoctors.map((doc) => {
    let score = 0;

    if (organFromCase) {
      const haystack =
        (
          (doc.specialization ?? "") +
          " " +
          (doc.subSpecialization ?? "") +
          " " +
          (doc.description ?? "")
        ).toLowerCase();

      if (haystack.includes(organFromCase)) {
        score += 10;
      }
    }

    if (matchedCase?.suspicionLevel === "high" && doc.isTelepathologyAvailable) {
      score += 3;
    }

    return { doc, score };
  });

  scoredDoctors.sort((a, b) => {
    if (a.score === b.score) {
      return a.doc.fullName.localeCompare(b.doc.fullName, "uk");
    }
    return b.score - a.score;
  });

  const mapDoctors = filteredDoctors.map((doc) => ({
    id: doc.id,
    fullName: doc.fullName,
    lat: doc.lat,
    lng: doc.lng,
    city: doc.city,
    region: doc.region,
    specialization: doc.specialization,
  }));

  // ---- href для фільтрів (збережемо caseId, якщо є) ----
  const makeHref = (value: string | null) => {
    const params = new URLSearchParams();
    if (caseId) params.set("caseId", caseId);
    if (value) params.set("organ", value);
    const query = params.toString();
    return query ? `/doctors?${query}` : "/doctors";
  };

  // ---- href для профілю лікаря (щоб caseId потрапив на сторінку лікаря) ----
  const makeDoctorHref = (slug: string) => {
    const params = new URLSearchParams();
    if (caseId) params.set("caseId", caseId);
    const query = params.toString();
    return query ? `/doctors/${slug}?${query}` : `/doctors/${slug}`;
  };

  return (
    <div className="container mx-auto max-w-6xl py-8 space-y-6">
      {/* Заголовок + лінк на головну */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Профілі лікарів</h1>
        <Link
          href="/"
          className="text-sm text-blue-600 underline underline-offset-4"
        >
          ← На головну
        </Link>
      </div>

      {/* Банер з кейсом, якщо прийшли з анкети */}
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

      {/* Блок завантаження файлів для кейсу */}
      {matchedCase && (
        <section className="space-y-2">
          <CaseAttachmentsUploader
            caseId={matchedCase.id}
            initialAttachments={attachmentSummaries}
          />
        </section>
      )}

      {/* Фільтр по органу */}
      <div className="flex flex-wrap gap-2">
        {organOptions.map((opt) => {
          const isActive =
            (!selectedOrganKey && opt.value === null) ||
            (selectedOrganKey && opt.value === selectedOrganKey);

          return (
            <Link
              key={opt.label}
              href={makeHref(opt.value)}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                isActive
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Карта — після фільтра */}
        <div className="min-h-[420px]">
          <DoctorsMap doctors={mapDoctors} />
        </div>

        {/* Список карток — після фільтра + з "Рекомендовано" */}
        <div className="grid gap-4 md:grid-cols-1">
          {scoredDoctors.map(({ doc, score }) => (
            <Link
              key={doc.id}
              href={makeDoctorHref(doc.slug)}
              className="block"
            >
              <DoctorCard doctor={doc} isRecommended={score > 0} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
