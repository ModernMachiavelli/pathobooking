import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Questionnaire from "@/components/Questionnaire";
import DoctorMap from "@/components/DoctorMap";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      {/* Шапка з лінком на список лікарів */}
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">PathoBooking</h1>
        <Link
          href="/doctors"
          className="text-sm text-blue-600 underline underline-offset-4"
        >
          Перейти до списку лікарів →
        </Link>
      </header>

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
