// src/app/cases/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CasesPage() {
  const cases = await prisma.patientCase.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      attachments: true,
      appointmentRequests: true,
    },
  });

  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-6">
      {/* Заголовок + назад на головну */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Кейси пацієнтів (debug)</h1>
          <p className="text-sm text-slate-600 mt-1">
            Список усіх кейсів у базі. Звідси можна перейти до повного перегляду
            кейсу або до підбору лікарів під конкретний кейс.
          </p>
        </div>

        <Link
          href="/"
          className="text-sm text-blue-600 underline underline-offset-4"
        >
          ← На головну
        </Link>
      </div>

      {cases.length === 0 ? (
        <p className="text-sm text-slate-500">
          Поки що кейсів немає. Створіть новий кейс через анкету на головній
          сторінці.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-xs md:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Кейс
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Орган / підозра
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Вік / стать
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Біопсія / матеріал
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Файли / запити
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Дії
                </th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => {
                const shortId = c.id.slice(-6).toUpperCase();
                const created = c.createdAt.toLocaleString("uk-UA", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const attachmentsCount = c.attachments.length;
                const requestsCount = c.appointmentRequests.length;

                return (
                  <tr
                    key={c.id}
                    className="border-b border-slate-100 hover:bg-slate-50/80"
                  >
                    {/* Кейс + дата */}
                    <td className="px-3 py-2 align-top whitespace-nowrap">
                      <div className="font-mono text-[11px] md:text-xs">
                        #{shortId}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {created}
                      </div>
                    </td>

                    {/* Орган / рівень підозри / тип пухлини */}
                    <td className="px-3 py-2 align-top">
                      <div className="font-medium">
                        {c.suspectedOrgan || "Орган не вказано"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Рівень підозри: {c.suspicionLevel || "не вказано"}
                      </div>
                      {c.suspectedCancerType && (
                        <div className="text-[11px] text-slate-500">
                          Тип пухлини: {c.suspectedCancerType}
                        </div>
                      )}
                    </td>

                    {/* Вік / стать */}
                    <td className="px-3 py-2 align-top">
                      <div className="text-sm">
                        {c.age != null ? `${c.age} років` : "Вік не вказано"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Стать: {c.sex || "не вказано"}
                      </div>
                    </td>

                    {/* Біопсія / матеріал / лікування */}
                    <td className="px-3 py-2 align-top">
                      <div className="text-[11px] text-slate-700">
                        Біопсія: {c.biopsyType || "не вказано"}
                      </div>
                      <div className="text-[11px] text-slate-700">
                        Матеріал: {c.materialType || "не вказано"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Лікування: {c.priorTreatment || "не вказано"}
                      </div>
                    </td>

                    {/* Файли / запити */}
                    <td className="px-3 py-2 align-top whitespace-nowrap">
                      <div className="text-[11px] text-slate-700">
                        Файлів:{" "}
                        <span className="font-semibold">
                          {attachmentsCount}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-700">
                        Запитів до лікарів:{" "}
                        <span className="font-semibold">
                          {requestsCount}
                        </span>
                      </div>
                    </td>

                    {/* Дії */}
                    <td className="px-3 py-2 align-top">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/cases/${c.id}`}
                          className="text-[11px] text-blue-700 underline underline-offset-4"
                        >
                          🔍 Переглянути кейс
                        </Link>
                        <Link
                          href={`/doctors?caseId=${c.id}`}
                          className="text-[11px] text-blue-700 underline underline-offset-4"
                        >
                          🩺 Підібрати лікаря
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
