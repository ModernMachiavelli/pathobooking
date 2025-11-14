# PathoBooking Starter (Canvas Export)

Це експорт файлів із Canvas для швидкого старту.

## Як використати
1) Створи новий проєкт Next.js:
   ```powershell
   pnpm create next-app pathobooking --ts --eslint --tailwind --src-dir --app --import-alias "@/*"
   ```
2) Скопіюй вміст цієї теки поверх свого проєкту (зберігаючи структуру шляхів).
3) Додай залежності:
   ```powershell
   pnpm add maplibre-gl react-hook-form zod @hookform/resolvers @tanstack/react-query @prisma/client prisma @supabase/supabase-js
   pnpm add -D @types/maplibre-gl ts-node
   ```
4) Налаштуй `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=ВАШ_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=ВАШ_SUPABASE_ANON_KEY
   DATABASE_URL=postgresql://postgres:postgres@db.<your>.supabase.co:5432/postgres
   NEXT_PUBLIC_MAP_STYLE_URL=https://demotiles.maplibre.org/style.json
   ```
5) Prisma:
   ```powershell
   pnpm dlx prisma migrate dev --name init
   pnpm dlx prisma generate
   pnpm exec ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
   ```
6) Запуск:
   ```powershell
   pnpm dev
   ```

> Компоненти `@/components/ui/*` ставляться через shadcn-ui:
```powershell
pnpm dlx shadcn-ui@latest init -y
pnpm dlx shadcn-ui@latest add button input textarea select label form dialog card tabs slider separator sheet badge tooltip
```
