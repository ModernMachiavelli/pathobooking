// src/components/Questionnaire.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

/**
 * Zod-схема форми
 */
const schema = z.object({
  // базові дані
  age: z
    .preprocess(
      (val) => (val === "" || val == null ? undefined : Number(val)),
      z
        .number({
          invalid_type_error: "Вік має бути числом",
        })
        .int("Вік має бути цілим числом")
        .min(0, "Вік не може бути від’ємним")
        .max(120, "Вік виглядає нереалістично")
        .optional()
    )
    .optional(),
  sex: z
    .enum(["male", "female", "other"])
    .optional()
    .nullable(),

  suspectedOrgan: z
    .string()
    .min(1, "Вкажіть, будь ласка, орган або ділянку, щодо якої є підозри")
    .max(200, "Занадто довгий опис органу"),
  suspicionLevel: z
    .enum(["low", "medium", "high"])
    .optional()
    .nullable(),

  mainComplaint: z
    .string()
    .min(
      10,
      "Опишіть, будь ласка, ситуацію трохи детальніше (мінімум 10 символів)"
    )
    .max(4000, "Занадто довгий опис"),
  freeTextSummary: z.string().max(4000).optional().nullable(),

  // клінічні онко-поля
  biopsyType: z
    .enum(["core", "excisional", "fna", "endoscopic", "other"])
    .optional()
    .nullable(),
  materialType: z
    .enum(["biopsy", "surgical", "cytology", "other"])
    .optional()
    .nullable(),
  priorTreatment: z
    .enum(["none", "surgery", "chemo", "radio", "targeted", "immuno", "other"])
    .optional()
    .nullable(),

  suspectedCancerType: z.string().max(200).optional().nullable(),
  stagingInfo: z.string().max(200).optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

export default function Questionnaire() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      age: undefined,
      sex: null,
      suspectedOrgan: "",
      suspicionLevel: "medium",
      mainComplaint: "",
      freeTextSummary: "",

      biopsyType: null,
      materialType: null,
      priorTreatment: "none",
      suspectedCancerType: "",
      stagingInfo: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setStatus("sending");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/patient-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          age: values.age ?? null,
          sex: values.sex ?? null,
          suspicionLevel: values.suspicionLevel ?? null,
          freeTextSummary: values.freeTextSummary || null,
          biopsyType: values.biopsyType ?? null,
          materialType: values.materialType ?? null,
          priorTreatment: values.priorTreatment ?? null,
          suspectedCancerType: values.suspectedCancerType || null,
          stagingInfo: values.stagingInfo || null,
          // tags: [] // на майбутнє, якщо захочеш додати ML-теги
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(
          (data && (data as any).error) ||
            "Сталася помилка під час створення кейсу."
        );
        setStatus("error");
        return;
      }

      const data = (await res.json()) as { id: string };
      setStatus("success");

      router.push(`/doctors?caseId=${data.id}`);
    } catch (e) {
      console.error("Error creating patient case:", e);
      setErrorMessage("Сталася непередбачена помилка. Спробуйте ще раз.");
      setStatus("error");
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const disabled = status === "sending";

  const sex = watch("sex");
  const suspicionLevel = watch("suspicionLevel");
  const biopsyType = watch("biopsyType");
  const materialType = watch("materialType");
  const priorTreatment = watch("priorTreatment");

  return (
    <Card>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-1">
          <div className="text-lg font-semibold">Анкета пацієнта</div>
          <p className="text-xs text-slate-600">
            Ця анкета допомагає підібрати патоморфологів, які найкраще підходять
            під ваш клінічний контекст. Ви можете вказати стільки деталей, скільки
            вважаєте за потрібне.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Блок 1: базова інформація */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              1. Базова інформація
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="age">Вік</Label>
                <Input
                  id="age"
                  type="number"
                  min={0}
                  max={120}
                  placeholder="Наприклад: 54"
                  {...register("age")}
                />
                {errors.age && (
                  <p className="text-[11px] text-red-600">
                    {errors.age.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Стать</Label>
                <Select
                  onValueChange={(val) =>
                    setValue("sex", val as FormValues["sex"], {
                      shouldValidate: true,
                    })
                  }
                  value={sex ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть стать" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Чоловіча</SelectItem>
                    <SelectItem value="female">Жіноча</SelectItem>
                    <SelectItem value="other">
                      Інша / не хочу вказувати
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.sex && (
                  <p className="text-[11px] text-red-600">
                    {errors.sex.message as string}
                  </p>
                )}
              </div>
            </div>
          </section>

          <Separator />

          {/* Блок 2: орган + рівень підозри */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              2. Область підозри
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="suspectedOrgan">
                  Орган / ділянка, щодо якої є підозри
                </Label>
                <Input
                  id="suspectedOrgan"
                  placeholder="Наприклад: молочна залоза, передміхурова залоза, легеня..."
                  {...register("suspectedOrgan")}
                />
                {errors.suspectedOrgan && (
                  <p className="text-[11px] text-red-600">
                    {errors.suspectedOrgan.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Рівень підозри на рак</Label>
                <Select
                  onValueChange={(val) =>
                    setValue(
                      "suspicionLevel",
                      val as FormValues["suspicionLevel"],
                      { shouldValidate: true }
                    )
                  }
                  value={suspicionLevel ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Оцініть приблизно" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      Низький (переважно для спокою)
                    </SelectItem>
                    <SelectItem value="medium">
                      Помірний (є підозри, потрібна друга думка)
                    </SelectItem>
                    <SelectItem value="high">
                      Високий (є значні зміни / підозра підтверджена частково)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.suspicionLevel && (
                  <p className="text-[11px] text-red-600">
                    {errors.suspicionLevel.message as string}
                  </p>
                )}
              </div>
            </div>
          </section>

          <Separator />

          {/* Блок 3: основні скарги / опис */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              3. Опис ситуації
            </h2>

            <div className="space-y-1">
              <Label htmlFor="mainComplaint">
                Основна скарга / причина звернення
              </Label>
              <textarea
                id="mainComplaint"
                className="min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                placeholder="Напишіть, що саме вас турбує, з чого все почалося, які обстеження вже проводились..."
                {...register("mainComplaint")}
              />
              {errors.mainComplaint && (
                <p className="text-[11px] text-red-600">
                  {errors.mainComplaint.message as string}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="freeTextSummary">
                Додатковий опис / інформація від вас (необов’язково)
              </Label>
              <textarea
                id="freeTextSummary"
                className="min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                placeholder="Будь-які деталі: супутні захворювання, сімейний анамнез, що для вас важливо від лікаря..."
                {...register("freeTextSummary")}
              />
              {errors.freeTextSummary && (
                <p className="text-[11px] text-red-600">
                  {errors.freeTextSummary.message as string}
                </p>
              )}
            </div>
          </section>

          <Separator />

          {/* Блок 4: клінічні онко-деталі */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              4. Деталі обстежень / лікування (якщо відомо)
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <Label>Тип біопсії</Label>
                <Select
                  onValueChange={(val) =>
                    setValue("biopsyType", val as FormValues["biopsyType"], {
                      shouldValidate: true,
                    })
                  }
                  value={biopsyType ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть, якщо відомо" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core">Core біопсія</SelectItem>
                    <SelectItem value="excisional">
                      Ексцизійна біопсія
                    </SelectItem>
                    <SelectItem value="fna">
                      Тонкоголкова аспіраційна (FNA)
                    </SelectItem>
                    <SelectItem value="endoscopic">
                      Ендоскопічна біопсія
                    </SelectItem>
                    <SelectItem value="other">
                      Інший / не впевнений
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.biopsyType && (
                  <p className="text-[11px] text-red-600">
                    {errors.biopsyType.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Тип матеріалу</Label>
                <Select
                  onValueChange={(val) =>
                    setValue(
                      "materialType",
                      val as FormValues["materialType"],
                      { shouldValidate: true }
                    )
                  }
                  value={materialType ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть, якщо відомо" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="biopsy">Біопсія</SelectItem>
                    <SelectItem value="surgical">Операційний матеріал</SelectItem>
                    <SelectItem value="cytology">Цитологія</SelectItem>
                    <SelectItem value="other">
                      Інше / не впевнений
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.materialType && (
                  <p className="text-[11px] text-red-600">
                    {errors.materialType.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Попереднє лікування</Label>
                <Select
                  onValueChange={(val) =>
                    setValue(
                      "priorTreatment",
                      val as FormValues["priorTreatment"],
                      { shouldValidate: true }
                    )
                  }
                  value={priorTreatment ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть варіант" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Лікування ще не проводилось
                    </SelectItem>
                    <SelectItem value="surgery">Операція</SelectItem>
                    <SelectItem value="chemo">Хіміотерапія</SelectItem>
                    <SelectItem value="radio">Променева терапія</SelectItem>
                    <SelectItem value="targeted">Таргетна терапія</SelectItem>
                    <SelectItem value="immuno">Імунотерапія</SelectItem>
                    <SelectItem value="other">
                      Інше / не впевнений
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.priorTreatment && (
                  <p className="text-[11px] text-red-600">
                    {errors.priorTreatment.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>
                  Якщо відомо, який тип пухлини підозрюється / вже озвучувався
                </Label>
                <Input
                  placeholder="Наприклад: інвазивна протокова карцинома, аденокарцинома простати..."
                  {...register("suspectedCancerType")}
                />
                {errors.suspectedCancerType && (
                  <p className="text-[11px] text-red-600">
                    {errors.suspectedCancerType.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Якщо вам відома стадія / TNM / група ризику</Label>
                <Input
                  placeholder="Наприклад: cT2N0M0, стадія II, низький ризик..."
                  {...register("stagingInfo")}
                />
                {errors.stagingInfo && (
                  <p className="text-[11px] text-red-600">
                    {errors.stagingInfo.message as string}
                  </p>
                )}
              </div>
            </div>
          </section>

          {status === "error" && errorMessage && (
            <p className="text-xs text-red-600">❌ {errorMessage}</p>
          )}

          {status === "success" && (
            <p className="text-xs text-emerald-700">
              ✅ Кейс створено. Зараз відкриється сторінка підбору лікарів.
            </p>
          )}

          <div className="pt-2">
            <Button type="submit" disabled={disabled} className="w-full md:w-auto">
              {status === "sending"
                ? "Створюємо кейс..."
                : "Підібрати лікарів для мого кейсу"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}