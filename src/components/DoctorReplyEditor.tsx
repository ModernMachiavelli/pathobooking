"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Props = {
  requestId: string;
  initialReply?: string | null;
  repliedAt?: string | null;
};

export default function DoctorReplyEditor({
  requestId,
  initialReply,
  repliedAt,
}: Props) {
  const router = useRouter();
  const [text, setText] = useState(initialReply ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const alreadyAnswered = !!initialReply;

  async function submitReply() {
    if (!text.trim()) {
      setError("Введіть, будь ласка, текст відповіді.");
      setSuccess(null);
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/appointment-requests/${requestId}/reply`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ doctorReply: text }),
          }
        );

        if (!res.ok) {
          let message = `Не вдалося зберегти відповідь (HTTP ${res.status})`;
          try {
            const data = await res.json();
            if (data?.error) message = data.error;
          } catch {
            // ignore
          }
          setError(message);
          return;
        }

        setSuccess("Відповідь збережено.");
        // оновити глобальний лічильник на навігації
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new Event("pathobooking:doctorRequestsChanged")
          );
        }
        router.refresh();
      } catch (e: any) {
        setError(e?.message || "Сталася помилка при збереженні відповіді.");
      }
    });
  }

  if (alreadyAnswered) {
    const dateLabel = repliedAt
      ? new Date(repliedAt).toLocaleString("uk-UA")
      : null;

    return (
      <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs">
        <div className="mb-1 font-semibold text-emerald-900">
          Відповідь лікаря
        </div>
        {dateLabel && (
          <div className="mb-1 text-[10px] text-emerald-800">
            Дата відповіді: {dateLabel}
          </div>
        )}
        <p className="whitespace-pre-wrap text-emerald-900">{initialReply}</p>
        {/* На цьому етапі відповіді редагувати не даємо.
           Можна буде додати "Редагувати" як окремий крок. */}
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2 text-xs">
      <div className="font-semibold text-slate-800">
        Відповідь по цьому кейсу (для пацієнта):
      </div>
      <Textarea
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Опишіть, що ви бачите по кейсу, чи потрібні додаткові дослідження, які ваші рекомендації..."
      />
      <div className="flex items-center gap-2">
        <Button
          size="xs"
          disabled={isPending}
          onClick={submitReply}
        >
          Зберегти відповідь
        </Button>
        {isPending && (
          <span className="text-[10px] text-slate-500">
            Зберігаємо відповідь…
          </span>
        )}
      </div>
      {error && <div className="text-[10px] text-red-500">{error}</div>}
      {success && (
        <div className="text-[10px] text-emerald-600">{success}</div>
      )}
    </div>
  );
}
