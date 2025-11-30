-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientCaseId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'other',
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" INTEGER,
    "contentType" TEXT,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_patientCaseId_fkey" FOREIGN KEY ("patientCaseId") REFERENCES "PatientCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
