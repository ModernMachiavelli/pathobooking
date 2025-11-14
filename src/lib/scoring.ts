import type { QItem } from "./questionnaire";

export type Answers = Record<string, any>;

export function deriveTags(items: QItem[], answers: Answers): string[] {
  const tags = new Set<string>();
  for (const it of items) {
    if (!it.options) continue;
    const v = (answers as any)[it.id];
    if (v == null) continue;
    const selected = Array.isArray(v) ? v : [v];
    for (const sel of selected) {
      const opt = it.options.find(o => o.value === sel);
      if (opt?.tags) opt.tags.forEach(t => tags.add(t));
    }
  }
  return [...tags];
}

export function scoreDoctor(doctor: { specialtyTags: string[] }, derived: string[]): number {
  const a = new Set(doctor.specialtyTags);
  const b = new Set(derived);
  const inter = [...a].filter(x => b.has(x)).length;
  const uni = new Set([...a, ...b]).size || 1;
  return inter / uni;
}
