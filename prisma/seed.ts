import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const specs = [
    { code: "breast", title: "Патоморфологія молочної залози" },
    { code: "gi", title: "ШКТ / поліпи" },
    { code: "derm", title: "Дерматопатологія" },
    { code: "he", title: "Гістологія H&E" },
    { code: "ihc", title: "Імуногістохімія" },
    { code: "biopsy", title: "Біопсія (загальне)" },
  ];
  for (const s of specs) {
    await prisma.specialty.upsert({ where: { code: s.code }, update: {}, create: s });
  }

  const makeDoc = async (fullName: string, city: string, region: string, lat: number, lng: number, codes: string[]) => {
    const email = `${fullName.replace(/\s+/g,'').toLowerCase()}@demo.local`;
    const user = await prisma.user.upsert({ where: { email }, update: {}, create: { email, role: "DOCTOR" as any } });
    const doc = await prisma.doctorProfile.create({ data: { userId: user.id, fullName, city, region, lat, lng, experienceY: 8, rating: 4.7 } });
    for (const c of codes) {
      const sp = await prisma.specialty.findUnique({ where: { code: c } });
      if (sp) await prisma.doctorSpecialty.create({ data: { doctorId: doc.id, specialtyId: sp.id } });
    }
  };

  await makeDoc("д-р Іваненко", "Київ", "м. Київ", 50.45, 30.52, ["breast","he"]);
  await makeDoc("д-р Коваль", "Львів", "Львівська", 49.84, 24.03, ["gi","ihc"]);
  await makeDoc("д-р Шевченко", "Одеса", "Одеська", 46.48, 30.72, ["derm","biopsy"]);
}

main().finally(()=>prisma.$disconnect());
