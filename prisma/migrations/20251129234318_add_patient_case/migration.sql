-- CreateTable
CREATE TABLE "PatientCase" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "age" INTEGER,
    "sex" TEXT,
    "suspectedOrgan" TEXT,
    "suspicionLevel" TEXT,
    "mainComplaint" TEXT,
    "freeTextSummary" TEXT,

    CONSTRAINT "PatientCase_pkey" PRIMARY KEY ("id")
);
