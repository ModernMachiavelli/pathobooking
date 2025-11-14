import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Questionnaire from "@/components/Questionnaire";
import DoctorMap from "@/components/DoctorMap";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">PathoBooking</h1>
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
