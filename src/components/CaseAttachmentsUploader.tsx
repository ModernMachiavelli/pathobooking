"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type AttachmentLite = {
  id: string;
  filename: string;
  url: string;
  type: string;
  createdAt: string;
};

type Props = {
  caseId: string;
  initialAttachments: AttachmentLite[];
};

export function CaseAttachmentsUploader({ caseId, initialAttachments }: Props) {
  const [attachments, setAttachments] = useState<AttachmentLite[]>(
    initialAttachments
  );
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<string>("other");
  const [status, setStatus] = useState<"idle" | "uploading">("idle");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f ?? null);
  };

  const onUpload = async () => {
    if (!file) return;
    setStatus("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch(
        `/api/patient-cases/${caseId}/attachments`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        console.error("Upload failed", await res.text());
        setStatus("idle");
        return;
      }

      const data = await res.json();
      setAttachments((prev) => [
        {
          id: data.id,
          filename: data.filename,
          url: data.url,
          type: data.type,
          createdAt: data.createdAt,
        },
        ...prev,
      ]);

      setFile(null);
      setStatus("idle");
    } catch (e) {
      console.error("Upload error", e);
      setStatus("idle");
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-1">
          <div className="text-sm font-semibold">
            Додати медичні файли до вашого кейсу
          </div>
          <p className="text-xs text-slate-600">
            Наприклад: звіти КТ/МРТ, результати лабораторних аналізів,
            заключення патоморфолога. Файли будуть доступні лікарям,
            яким ви надішлете цей кейс.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="file">Файл</Label>
          <Input
            id="file"
            type="file"
            onChange={onFileChange}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="fileType">Тип файлу (умовно)</Label>
          <select
            id="fileType"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="other">Інше</option>
            <option value="histology">Гістологія</option>
            <option value="imaging">КТ / МРТ / УЗД</option>
            <option value="lab_report">Лабораторні аналізи</option>
          </select>
        </div>

        <Button
          type="button"
          onClick={onUpload}
          disabled={!file || status === "uploading"}
        >
          {status === "uploading"
            ? "Завантаження..."
            : "Завантажити файл"}
        </Button>

        {attachments.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-slate-700">
              Завантажені файли:
            </div>
            <ul className="space-y-1 text-xs">
              {attachments.map((a) => (
                <li key={a.id} className="flex items-center justify-between">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline underline-offset-4"
                  >
                    {a.filename}
                  </a>
                  <span className="text-slate-500">{a.type}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
