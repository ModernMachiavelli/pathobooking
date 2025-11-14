// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding doctors...');

  // На всяк випадок очищаємо таблицю (в девелопменті ок)
  await prisma.doctor.deleteMany();

  await prisma.doctor.createMany({
    data: [
      {
        fullName: 'д-р Ірина Коваленко',
        slug: 'iryna-kovalenko',
        email: 'iryna.kovalenko@example.com',
        phone: '+380501112233',
        clinicName: 'Сумський обласний онкодиспансер',
        city: 'Суми',
        region: 'Сумська',
        specialization: 'патоморфолог',
        subSpecialization: 'рак молочної залози, рак шкіри',
        yearsOfExperience: 10,
        description:
          'Патоморфолог із фокусом на ранню діагностику раку молочної залози та шкіри. Працює з цифровою патологією та телепатологією.',
        avatarUrl: '/avatars/doc-1.png',
        isTelepathologyAvailable: true,
        isAcceptingNewPatients: true,
        lat: 50.9077,
        lng: 34.7981,
      },
      {
        fullName: 'д-р Олександр Петренко',
        slug: 'oleksandr-petrenko',
        email: 'oleksandr.petrenko@example.com',
        phone: '+380671234567',
        clinicName: 'Національний інститут раку',
        city: 'Київ',
        region: 'м. Київ',
        specialization: 'патоморфолог',
        subSpecialization: 'легені, лімфоми',
        yearsOfExperience: 15,
        description:
          'Спеціалізується на діагностиці раку легень та лімфопроліферативних захворювань. Має великий досвід у складних діагностичних кейсах.',
        avatarUrl: '/avatars/doc-2.png',
        isTelepathologyAvailable: true,
        isAcceptingNewPatients: false,
        lat: 50.4501,
        lng: 30.5234,
      },
      {
        fullName: 'д-р Наталія Шевченко',
        slug: 'nataliia-shevchenko',
        email: 'nataliia.shevchenko@example.com',
        phone: '+380931234567',
        clinicName: 'Львівський онкологічний центр',
        city: 'Львів',
        region: 'Львівська',
        specialization: 'онколог',
        subSpecialization: 'системна терапія солідних пухлин',
        yearsOfExperience: 12,
        description:
          'Клінічний онколог, який працює в мультидисциплінарній команді разом з патоморфологами. Допомагає підбирати схеми лікування.',
        avatarUrl: '/avatars/doc-3.png',
        isTelepathologyAvailable: false,
        isAcceptingNewPatients: true,
        lat: 49.8397,
        lng: 24.0297,
      },
    ],
  });

  console.log('Doctors seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
