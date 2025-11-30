// src/app/doctors/[slug]/requests/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DoctorRequestsTable } from "@/components/DoctorRequestsTable";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DoctorRequestsPage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const doctor = await prisma.doctor.findFirst({
    where: { slug },
    include: {
      appointmentRequests: {
        orderBy: { createdAt: "desc" },
        include: {
          patientCase: {
            include: {
              attachments: true,
            },
          },
        },
      },
    },
  });

  if (!doctor) {
    notFound();
  }

  const requests = doctor.appointmentRequests.map((req) => ({
    id: req.id,
    createdAt: req.createdAt.toISOString(),
    status: req.status,
    patientEmail: req.patientEmail ?? "",
    message: req.message ?? "",
    patientCase: {
      id: req.patientCase.id,
      suspectedOrgan: req.patientCase.suspectedOrgan ?? "",
      suspicionLevel: req.patientCase.suspicionLevel ?? "",
      attachmentsCount: req.patientCase.attachments.length,
    },
  }));

  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Вхідні запити для {doctor.fullName}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Тут відображаються пацієнтські кейси, які були надіслані цьому
            лікарю через PathoBooking.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Link
            href={`/doctors/${doctor.slug}`}
            className="text-sm text-blue-600 underline underline-offset-4"
          >
            ← Профіль лікаря
          </Link>
          <Link
            href="/"
            className="text-xs text-slate-500 underline underline-offset-4"
          >
            На головну
          </Link>
        </div>
      </div>

      <DoctorRequestsTable
        doctorName={doctor.fullName}
        doctorSlug={doctor.slug}
        requests={requests}
      />
    </div>
  );
}
