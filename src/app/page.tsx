// src/app/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Questionnaire from "@/components/Questionnaire";
import DoctorMap from "@/components/DoctorMap";
import Link from "next/link";

export default function Home() {
  return (
    <main className="container mx-auto p-4 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">PathoBooking</h1>

        {/* Debug-лінк на список кейсів */}
        <Link
          href="/cases"
          className="text-xs text-slate-500 underline underline-offset-4"
        >
          🔍 Мої кейси (debug)
        </Link>
      </div>

      <Tabs defaultValue="form">
        <TabsList>
          <TabsTrigger value="form">Анкета</TabsTrigger>
          <TabsTrigger value="map">Карта лікарів</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <Questionnaire />
        </TabsContent>
        <TabsContent value="map">
          <DoctorMap />
        </TabsContent>
      </Tabs>
    </main>
  );
}