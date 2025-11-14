-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "clinicName" TEXT,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "subSpecialization" TEXT,
    "yearsOfExperience" INTEGER,
    "description" TEXT,
    "avatarUrl" TEXT,
    "isTelepathologyAvailable" BOOLEAN NOT NULL DEFAULT false,
    "isAcceptingNewPatients" BOOLEAN NOT NULL DEFAULT true,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_slug_key" ON "Doctor"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_email_key" ON "Doctor"("email");
