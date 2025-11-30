// src/components/DoctorRequestForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type DoctorRequestFormProps = {
  doctorId: string;
  caseId: string;
  suspectedOrgan: string | null;
  suspicionLevel: string | null;
};

type FormValues = {
  patientEmail: string;
  message: string;
};

export function DoctorRequestForm({
  doctorId,
  caseId,
  suspectedOrgan,
  suspicionLevel,
}: DoctorRequestFormProps) {
  const { register, handleSubmit, formState, reset } = useForm<FormValues>({
    defaultValues: {
      patientEmail: "",
      message: "",
    },
  });

  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (values: FormValues) => {
    setStatus("sending");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/appointment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          doctorId,
          patientEmail: values.patientEmail || undefined,
          message: values.message || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data?.error ?? "Сталася помилка під час відправки.");
        setStatus("error");
        return;
      }

      setStatus("success");
      reset();
    } catch (e) {
      console.error("Error sending appointment request:", e);
      setErrorMessage("Сталася помилка під час відправки.");
      setStatus("error");
    }
  };

  const disabled = status === "sending";

  return (
    <Card>
      <CardContent className="space-y-4 pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold">
              Надіслати свій кейс цьому лікарю
            </div>
            <div className="text-xs text-slate-600">
              Ви переглядаєте лікаря в контексті вашого кейсу{" "}
              <span className="font-mono">
                #{caseId.slice(-6).toUpperCase()}
              </span>
              {suspectedOrgan && (
                <>
                  {" "}
                  (орган:{" "}
                  <span className="font-semibold">{suspectedOrgan}</span>
                  {suspicionLevel ? `, рівень: ${suspicionLevel}` : ""})
                </>
              )}
              .
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="patientEmail">
              Ваш email для зворотного зв&apos;язку
            </Label>
            <Input
              id="patientEmail"
              type="email"
              placeholder="you@example.com"
              {...register("patientEmail", {
                required: "Вкажіть email, щоб лікар міг з вами зв'язатися",
              })}
            />
            {formState.errors.patientEmail && (
              <p className="text-xs text-red-600">
                {formState.errors.patientEmail.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">
              Коротко, чого ви очікуєте від консультації
            </Label>
            <Textarea
              id="message"
              placeholder="Наприклад: хочу отримати другу думку щодо результатів біопсії..."
              {...register("message")}
            />
          </div>

          {status === "success" && (
            <p className="text-xs text-emerald-700">
              ✅ Запит надіслано. Лікар або його асистент зможе переглянути ваш
              кейс і зв&apos;язатися з вами за вказаним email.
            </p>
          )}

          {status === "error" && errorMessage && (
            <p className="text-xs text-red-600">❌ {errorMessage}</p>
          )}

          <Button type="submit" disabled={disabled} className="w-full">
            {status === "sending" ? "Відправка..." : "Надіслати кейс цьому лікарю"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
