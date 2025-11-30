"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { questionnaireV1 } from "@/lib/questionnaire";
import { deriveTags } from "@/lib/scoring";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const schema = z.object({
  age: z.coerce.number().min(0).max(120),
  sex: z.string().min(1),
  location: z.string().min(1),
  symptoms: z.array(z.string()).optional().default([]),
  files: z.string().optional().default("")
});

type QuestionnaireFormValues = {
  age?: number;
  sex?: "male" | "female" | "other";
  suspectedOrgan?: string;
  suspicionLevel?: "low" | "medium" | "high";
  mainComplaint?: string;
  freeTextSummary?: string;
};

type FormData = z.infer<typeof schema>;

export default function Questionnaire() {
  const router = useRouter();

  const form = useForm<QuestionnaireFormValues>({
    defaultValues: {
      age: undefined,
      sex: undefined,
      suspectedOrgan: "",
      suspicionLevel: "medium",
      mainComplaint: "",
      freeTextSummary: "",
    },
  });

  const onSubmit = async (values: QuestionnaireFormValues) => {
    try {
      const res = await fetch("/api/patient-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: values.age ? Number(values.age) : undefined,
          sex: values.sex,
          suspectedOrgan: values.suspectedOrgan || undefined,
          suspicionLevel: values.suspicionLevel,
          mainComplaint: values.mainComplaint || undefined,
          freeTextSummary: values.freeTextSummary || undefined,
        }),
      });

      if (!res.ok) {
        console.error("Failed to create patient case");
        // тут можна показати toast / помилку у формі
        return;
      }

      const data = await res.json();
      const caseId = data.id as string;

      // 👉 після збереження кейсу ведемо користувача до лікарів
      router.push(`/doctors?caseId=${caseId}`);
    } catch (e) {
      console.error("Error while submitting questionnaire:", e);
    }
  };

  // далі ти просто використовуєш form.handleSubmit(onSubmit) у <form>
return (
  <form
    onSubmit={form.handleSubmit(onSubmit)}
    className="space-y-4 max-w-xl"
  >
    <Card>
      <CardContent className="space-y-4 pt-4">
        {/* Вік */}
        <div className="grid gap-2">
          <Label htmlFor="age">Вік</Label>
          <Input
            id="age"
            type="number"
            placeholder="Наприклад, 55"
            {...form.register("age", { valueAsNumber: true })}
          />
        </div>

        {/* Стать */}
        <div className="grid gap-2">
          <Label>Стать</Label>
          <Select
            value={form.watch("sex") ?? ""}
            onValueChange={(value) =>
              form.setValue("sex", value as "male" | "female" | "other")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Оберіть стать" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Чоловіча</SelectItem>
              <SelectItem value="female">Жіноча</SelectItem>
              <SelectItem value="other">Інша / не вказувати</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Підозрюваний орган / зона */}
        <div className="grid gap-2">
          <Label htmlFor="organ">Орган / зона, де виявлено проблему</Label>
          <Input
            id="organ"
            placeholder="Наприклад: молочна залоза, простата, легені..."
            {...form.register("suspectedOrgan")}
          />
        </div>

        {/* Рівень підозри */}
        <div className="grid gap-2">
          <Label>Наскільки серйозною здається ситуація?</Label>
          <Select
            value={form.watch("suspicionLevel") ?? "medium"}
            onValueChange={(value) =>
              form.setValue(
                "suspicionLevel",
                value as "low" | "medium" | "high"
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Оберіть рівень" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Низька</SelectItem>
              <SelectItem value="medium">Середня</SelectItem>
              <SelectItem value="high">Висока</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Основна скарга */}
        <div className="grid gap-2">
          <Label htmlFor="complaint">Коротко опишіть, що вас турбує</Label>
          <Input
            id="complaint"
            placeholder="Наприклад: за результатами мамографії виявлено підозрілу ділянку..."
            {...form.register("mainComplaint")}
          />
        </div>

        {/* Додаткова інформація */}
        <div className="grid gap-2">
          <Label htmlFor="summary">Додаткова інформація (необов'язково)</Label>
          <Input
            id="summary"
            placeholder="Будь-які деталі, які вважаєте важливими"
            {...form.register("freeTextSummary")}
          />
        </div>

        <Separator />

        <Button type="submit" className="w-full">
          Підібрати лікаря
        </Button>
      </CardContent>
    </Card>
  </form>
);
}
