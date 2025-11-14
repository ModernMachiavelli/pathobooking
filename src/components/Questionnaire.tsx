"use client";
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

type FormData = z.infer<typeof schema>;

export default function Questionnaire() {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { symptoms: [] }
  });
  const [result, setResult] = useState<{tags: string[], top: any[]}|null>(null);

  const onSubmit = (data: FormData) => {
    const tags = deriveTags(questionnaireV1.items, data as any);
    const doctors = [
      { id: "1", name: "д-р Іваненко", city: "Київ", lat: 50.45, lng: 30.52, specialtyTags: ["breast", "he"] },
      { id: "2", name: "д-р Коваль", city: "Львів", lat: 49.84, lng: 24.03, specialtyTags: ["gi", "ihc"] },
      { id: "3", name: "д-р Шевченко", city: "Одеса", lat: 46.48, lng: 30.72, specialtyTags: ["derm", "biopsy"] }
    ];
    const scored = doctors
      .map(d => ({...d, score: (tags.length ? (d.specialtyTags.filter(t => tags.includes(t)).length / new Set([...d.specialtyTags, ...tags]).size) : 0)}))
      .sort((a,b) => b.score - a.score)
      .slice(0, 5);
    setResult({ tags, top: scored });
  };

  const onSelect = (id: string, value: string) => setValue(id as any, value as any);

  return (
    <Card className="max-w-3xl">
      <CardContent className="space-y-4 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Вік</Label>
              <Input type="number" {...register("age")} />
              {errors.age && <p className="text-sm text-red-500">Некоректний вік</p>}
            </div>
            <div>
              <Label>Стать</Label>
              <Select onValueChange={(v)=>onSelect("sex", v)}>
                <SelectTrigger><SelectValue placeholder="Обрати..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Чоловіча</SelectItem>
                  <SelectItem value="female">Жіноча</SelectItem>
                </SelectContent>
              </Select>
              {errors.sex && <p className="text-sm text-red-500">Оберіть стать</p>}
            </div>
            <div>
              <Label>Регіон</Label>
              <Select onValueChange={(v)=>onSelect("location", v)}>
                <SelectTrigger><SelectValue placeholder="Обрати..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kyiv">м. Київ</SelectItem>
                  <SelectItem value="lviv">Львівська область</SelectItem>
                  <SelectItem value="kharkiv">Харківська область</SelectItem>
                  <SelectItem value="odesa">Одеська область</SelectItem>
                </SelectContent>
              </Select>
              {errors.location && <p className="text-sm text-red-500">Оберіть регіон</p>}
            </div>
          </div>

          <Separator />

          <div>
            <Label>Симптоми / що турбує</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {questionnaireV1.items.find(i=>i.id==="symptoms")!.options!.map(opt => (
                <label key={opt.value} className="flex items-center gap-2">
                  <input type="checkbox" value={opt.value} onChange={(e)=>{
                    const current = new Set((watch("symptoms")||[]) as string[]);
                    if (e.target.checked) current.add(opt.value); else current.delete(opt.value);
                    const arr = Array.from(current);
                    (setValue as any)("symptoms", arr, { shouldDirty: true });
                  }} />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Посилання на файли/знімки (тимчасово)</Label>
            <Input placeholder="URL або залиш порожнім" {...register("files")} />
          </div>

          <div className="pt-2">
            <Button type="submit">Підібрати лікарів</Button>
          </div>
        </form>

        {result && (
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold">Знайдені теги: {result.tags.join(", ") || "—"}</h3>
            <ul className="list-disc pl-5">
              {result.top.map((d:any)=>(
                <li key={d.id}>{d.name} ({d.city}) — релевантність: {(d.score*100).toFixed(0)}%</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
