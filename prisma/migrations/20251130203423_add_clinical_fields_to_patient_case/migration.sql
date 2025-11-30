-- AlterTable
ALTER TABLE "PatientCase" ADD COLUMN     "biopsyType" TEXT,
ADD COLUMN     "materialType" TEXT,
ADD COLUMN     "priorTreatment" TEXT,
ADD COLUMN     "stagingInfo" TEXT,
ADD COLUMN     "suspectedCancerType" TEXT;
