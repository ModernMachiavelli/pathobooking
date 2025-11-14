Як використати цей файл:
1) Розпакуйте архів у корінь вашого проєкту Next.js — з'явиться файл prisma/.env
2) В prisma/.env замініть <YOUR_PASSWORD> і <YOUR_PROJECT_REF> на значення з Supabase.
   - Project ref — у налаштуваннях Supabase (частина хоста після db.).
   - Якщо у паролі є '@' або інші спецсимволи — закодуйте їх (напр., '@' → %40).
3) Переконайтесь, що у prisma/schema.prisma є:
     datasource db {
       provider  = "postgresql"
       url       = env("DATABASE_URL")
       directUrl = env("DIRECT_URL")
     }
4) Запустіть міграції:
     pnpm dlx prisma migrate dev --name init --schema=prisma/schema.prisma
     pnpm dlx prisma generate --schema=prisma/schema.prisma
5) За потреби — засійте дані:
     pnpm exec ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
