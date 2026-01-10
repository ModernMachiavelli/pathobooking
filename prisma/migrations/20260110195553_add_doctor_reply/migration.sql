-- AlterTable
ALTER TABLE "AppointmentRequest" ADD COLUMN     "doctorReply" TEXT,
ADD COLUMN     "doctorReplyCreatedAt" TIMESTAMP(3),
ADD COLUMN     "isReadByDoctor" BOOLEAN NOT NULL DEFAULT false;
