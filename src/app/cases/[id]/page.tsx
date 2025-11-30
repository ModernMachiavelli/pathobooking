// src/app/cases/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

type StatusLabel = "PENDING" | "ACCEPTED" | "REJECTED" | "DONE";

const STATUS_LABELS: Record<StatusLabel, string> = {
  PENDING: "Очікує відповіді",
  ACCEPTED: "Прийнято",
  REJECTED: "Відхилено",
  DONE: "Завершено",
};

export default async function CasePage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const patientCase = await prisma.patientCase.findUnique({
    where: { id },
    include: {
      attachments: {
        orderBy: { createdAt: "desc" },
      },
      appointmentRequests: {
        orderBy: { createdAt: "desc" },
        include: {
          doctor: true,
        },
      },
    },
  });

  if (!patientCase) {
    notFound();
  }

  const shortId = patientCase.id.slice(-6).toUpperCase();

  const createdAt = patientCase.createdAt.toLocaleString("uk-UA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const attachments = patientCase.attachments;
  const requests = patientCase.appointmentRequests;

  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-6">
      {/* Навігація */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Кейс #{shortId}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Створено: {createdAt}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Link
            href="/"
            className="text-sm text-blue-600 underline underline-offset-4"
          >
            ← На головну
          </Link>
        </div>
      </div>

      {/* Основна інформація про кейс */}
      <section className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <h2 className="text-lg font-semibold">Загальна інформація</h2>
        <div className="grid gap-2 text-sm md:grid-cols-2">
          <div>
            <span className="font-medium">Підозрюваний орган: </span>
            <span>
              {patientCase.suspectedOrgan || "не вказано"}
            </span>
          </div>
          <div>
            <span className="font-medium">Рівень підозри: </span>
            <span>
              {patientCase.suspicionLevel || "не вказано"}
            </span>
          </div>
          <div>
            <span className="font-medium">Вік: </span>
            <span>
              {patientCase.age != null ? patientCase.age : "не вказано"}
            </span>
          </div>
          <div>
            <span className="font-medium">Стать: </span>
            <span>{patientCase.sex || "не вказано"}</span>
          </div>
        </div>

        {patientCase.mainComplaint && (
          <div className="text-sm">
            <div className="font-medium mb-1">Основна скарга:</div>
            <p className="text-slate-700 whitespace-pre-line">
              {patientCase.mainComplaint}
            </p>
          </div>
        )}

        {patientCase.freeTextSummary && (
          <div className="text-sm">
            <div className="font-medium mb-1">
              Додатковий опис / контекст:
            </div>
            <p className="text-slate-700 whitespace-pre-line">
              {patientCase.freeTextSummary}
            </p>
          </div>
        )}
      </section>

      {/* Файли кейсу */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Прикріплені файли</h2>

        {attachments.length === 0 ? (
          <p className="text-sm text-slate-500">
            До цього кейсу ще не додано жодного файлу. Додати файли можна на
            сторінці підбору лікарів для цього кейсу.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {attachments.map((a) => {
              const created = a.createdAt.toLocaleString("uk-UA", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              });

              const isImage = a.contentType?.startsWith("image/");

              return (
                <li
                  key={a.id}
                  className="flex flex-col gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 underline underline-offset-4"
                      >
                        {a.filename}
                      </a>
                      <span className="text-[11px] text-slate-500">
                        Тип: {a.type} • Додано: {created}
                      </span>
                    </div>
                  </div>

                  {isImage && (
                    <div className="mt-2 md:mt-0">
                      <img
                        src={a.url}
                        alt={a.filename}
                        className="h-16 w-16 rounded-md object-cover border border-slate-200"
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Запити до лікарів */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Запити до лікарів</h2>

        {requests.length === 0 ? (
          <p className="text-sm text-slate-500">
            Для цього кейсу ще не було створено жодного запиту до лікарів.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-xs md:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Дата
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Лікар
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Контакт
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Повідомлення
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const created = r.createdAt.toLocaleString("uk-UA", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const status = r.status as StatusLabel;

                  return (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 hover:bg-slate-50/80"
                    >
                      <td className="px-3 py-2 align-top whitespace-nowrap">
                        <div className="font-mono text-[11px] md:text-xs">
                          {created}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          #{r.id.slice(-6).toUpperCase()}
                        </div>
                      </td>

                      <td className="px-3 py-2 align-top">
                        {r.doctor ? (
                          <div className="flex flex-col">
                            <Link
                              href={`/doctors/${r.doctor.slug}?caseId=${patientCase.id}`}
                              className="text-blue-700 underline underline-offset-4"
                            >
                              {r.doctor.fullName}
                            </Link>
                            <span className="text-[11px] text-slate-500">
                              {r.doctor.specialization ||
                                "Спеціалізація не вказана"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">
                            Лікаря видалено
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2 align-top">
                        {r.patientEmail ? (
                          <a
                            href={`mailto:${r.patientEmail}`}
                            className="text-blue-600 underline underline-offset-2"
                          >
                            {r.patientEmail}
                          </a>
                        ) : (
                          <span className="text-slate-400">
                            Email не вказано
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2 align-top max-w-xs">
                        {r.message ? (
                          <p className="text-xs text-slate-700 line-clamp-3">
                            {r.message}
                          </p>
                        ) : (
                          <span className="text-slate-400">
                            Без повідомлення
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2 align-top">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {STATUS_LABELS[status] ?? r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
