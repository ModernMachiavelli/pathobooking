// src/components/RequestStatusActions.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Status = "PENDING" | "ACCEPTED" | "REJECTED" | "DONE";

type Props = {
  requestId: string;
  currentStatus: Status;
};

function statusLabel(status: Status): string {
  switch (status) {
    case "PENDING":
      return "Очікує";
    case "ACCEPTED":
      return "Прийнято";
    case "REJECTED":
      return "Відхилено";
    case "DONE":
      return "Завершено";
    default:
      return status;
  }
}

export default function RequestStatusActions({
  requestId,
  currentStatus,
}: Props) {
  const router = useRouter();
  const [localStatus, setLocalStatus] = useState<Status>(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function updateStatus(next: Status) {
    if (isPending || next === localStatus) return;

    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/appointment-requests/${requestId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: next }),
        });

        // 🔍 Лог у консоль, щоб бачити, що приходить з бекенду
        console.log("PATCH status:", res.status, res.statusText);

        if (!res.ok) {
          let message = `Не вдалося оновити статус (HTTP ${res.status})`;
          try {
            const txt = await res.text();
            console.log("PATCH response body:", txt);
            const data = JSON.parse(txt);
            if (data?.error) message = data.error + ` (HTTP ${res.status})`;
          } catch {
            // якщо не JSON — просто показуємо статус
          }
          setError(message);
          return;
        }

        setLocalStatus(next);
        router.refresh();
      } catch (e: any) {
        setError(e?.message || "Помилка оновлення статусу");
      }
    });
  }

  return (
    <div className="space-y-1 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-slate-600">Статус:</span>
        <Badge variant="outline">{statusLabel(localStatus)}</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="xs"
          variant={localStatus === "ACCEPTED" ? "default" : "outline"}
          disabled={isPending}
          onClick={() => updateStatus("ACCEPTED")}
        >
          Прийняти
        </Button>
        <Button
          size="xs"
          variant={localStatus === "REJECTED" ? "default" : "outline"}
          disabled={isPending}
          onClick={() => updateStatus("REJECTED")}
        >
          Відхилити
        </Button>
        <Button
          size="xs"
          variant={localStatus === "DONE" ? "default" : "outline"}
          disabled={isPending}
          onClick={() => updateStatus("DONE")}
        >
          Завершено
        </Button>
      </div>

      {error && (
        <div className="text-[10px] text-red-500">
          {error}
        </div>
      )}

      {isPending && (
        <div className="text-[10px] text-slate-500">
          Оновлюємо статус…
        </div>
      )}
    </div>
  );
}
