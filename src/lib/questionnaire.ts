export type QOption = { value: string; label: string; weight?: number; tags?: string[] };
export type QItem = {
  id: string;
  type: "select" | "multiselect" | "text" | "number" | "radio" | "checkbox";
  label: string;
  help?: string;
  required?: boolean;
  options?: QOption[];
  showIf?: { id: string; in: string[] };
  placeholder?: string;
};

export type Questionnaire = {
  version: number;
  items: QItem[];
};

export const questionnaireV1: Questionnaire = {
  version: 1,
  items: [
    {
      id: "age",
      type: "number",
      label: "Вік",
      required: true,
    },
    {
      id: "sex",
      type: "radio",
      label: "Стать",
      required: true,
      options: [
        { value: "male", label: "Чоловіча" },
        { value: "female", label: "Жіноча" },
      ],
    },
    {
      id: "location",
      type: "select",
      label: "Місце розташування (область)",
      required: true,
      options: [
        { value: "kyiv", label: "м. Київ" },
        { value: "lviv", label: "Львівська область" },
        { value: "kharkiv", label: "Харківська область" },
        { value: "odesa", label: "Одеська область" }
      ],
    },
    {
      id: "symptoms",
      type: "multiselect",
      label: "Симптоми / що турбує",
      options: [
        { value: "biopsy_available", label: "Є результати біопсії", tags: ["biopsy"] },
        { value: "histology_he", label: "Є гістологія (H&E)", tags: ["he"] },
        { value: "ihc", label: "Є ІГХ (IHC)", tags: ["ihc"] },
        { value: "mole_change", label: "Зміни родимки/утворення", tags: ["derm"] },
        { value: "breast_lump", label: "Утворення у молочній залозі", tags: ["breast"] },
        { value: "gi_issue", label: "Проблеми ШКТ/поліпи", tags: ["gi"] }
      ]
    },
    {
      id: "files",
      type: "text",
      label: "Посилання на файли/знімки (тимчасово)",
      placeholder: "Додайте посилання або залиште порожнім",
    }
  ]
};
