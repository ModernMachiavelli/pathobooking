// src/components/DoctorRequestsTable.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AppointmentStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "DONE";

type RequestRow = {
  id: string;
  createdAt: string;
  status: AppointmentStatus;
  patientEmail: string;
  message: string;
  patientCase: {
    id: string;
    suspectedOrgan: string;
    suspicionLevel: string;
    attachmentsCount: number;
  };
};

type Props = {
  doctorName: string;
  doctorSlug: string;
  requests: RequestRow[];
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Очікує відповіді",
  ACCEPTED: "Прийнято",
  REJECTED: "Відхилено",
  DONE: "Завершено",
};

export function DoctorRequestsTable({ doctorName, requests }: Props) {
  const [rows, setRows] = useState<RequestRow[]>(requests);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateStatus = async (id: string, newStatus: AppointmentStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/appointment-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        console.error("Failed to update status", await res.text());
        setUpdatingId(null);
        return;
      }

      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: newStatus,
              }
            : r
        )
      );
    } catch (e) {
      console.error("Error updating status", e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-1">
          <div className="text-sm font-semibold">
            Вхідні запити пацієнтів для {doctorName}
          </div>
          <p className="text-xs text-slate-600">
            Тут відображаються пацієнтські кейси, відправлені цьому лікарю.
            Статуси зараз оновлюються лише в системі (без реальних листів).
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">
            Поки що немає жодного запиту. Коли пацієнти надішлють кейси через
            форму &quot;Надіслати кейс цьому лікарю&quot;, вони з&apos;являться
            тут.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-2 py-2 text-left font-medium text-slate-600">
                    Дата
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">
                    Кейс
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">
                    Контакт
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">
                    Повідомлення
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">
                    Файли
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const date = new Date(r.createdAt);
                  const dateStr = date.toLocaleString("uk-UA", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 hover:bg-slate-50/80"
                    >
                      <td className="px-2 py-2 align-top whitespace-nowrap">
                        <div className="font-mono text-[11px] md:text-xs">
                          {dateStr}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          #{r.patientCase.id.slice(-6).toUpperCase()}
                        </div>
                      </td>

                      <td className="px-2 py-2 align-top">
                        <div className="font-medium">
                          {r.patientCase.suspectedOrgan || "Орган не вказано"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Рівень підозри:{" "}
                          {r.patientCase.suspicionLevel || "невідомо"}
                        </div>
                      </td>

                      <td className="px-2 py-2 align-top">
                        {r.patientEmail ? (
                          <a
                            href={`mailto:${r.patientEmail}`}
                            className="text-blue-600 underline underline-offset-2"
                          >
                            {r.patientEmail}
                          </a>
                        ) : (
                          <span className="text-slate-400">
                            Email не вказаний
                          </span>
                        )}
                      </td>

                      <td className="px-2 py-2 align-top max-w-xs">
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

                      <td className="px-2 py-2 align-top whitespace-nowrap">
                        {r.patientCase.attachmentsCount > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-800">
                            {r.patientCase.attachmentsCount} файл(и)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">
                            Немає файлів
                          </span>
                        )}
                      </td>

                      <td className="px-2 py-2 align-top">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                            {STATUS_LABELS[r.status]}
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(["PENDING", "ACCEPTED", "REJECTED", "DONE"] as AppointmentStatus[])
                              .filter((s) => s !== r.status)
                              .map((s) => (
                                <Button
                                  key={s}
                                  type="button"
                                  variant="outline"
                                  size="xs"
                                  disabled={updatingId === r.id}
                                  className="text-[10px] px-2 py-0 h-6"
                                  onClick={() => updateStatus(r.id, s)}
                                >
                                  {STATUS_LABELS[s]}
                                </Button>
                              ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
