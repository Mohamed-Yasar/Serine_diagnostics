/*
  Warnings:

  - You are about to drop the column `patientEmail` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `patientName` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `patientPhone` on the `appointments` table. All the data in the column will be lost.
  - Added the required column `biologicalSex` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateOfBirth` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasPhysicianOrder` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insuranceType` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recommendedFor` to the `lab_packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tagline` to the `lab_packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testCount` to the `lab_packages` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `lab_packages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `originalValue` on table `lab_packages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `turnaroundTime` on table `lab_packages` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `categoryLabel` to the `lab_tests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicalSignificance` to the `lab_tests` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `lab_tests` required. This step will fail if there are existing NULL values in that column.
  - Made the column `turnaroundTime` on table `lab_tests` required. This step will fail if there are existing NULL values in that column.
  - Made the column `specimenType` on table `lab_tests` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `fax` to the `locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hoursSaturday` to the `locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hoursSunday` to the `locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hoursWeekday` to the `locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transitInfo` to the `locations` table without a default value. This is not possible if the table is not empty.
  - Made the column `shortName` on table `locations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `locations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "patientEmail",
DROP COLUMN "patientName",
DROP COLUMN "patientPhone",
ADD COLUMN     "biologicalSex" TEXT NOT NULL,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "hasPhysicianOrder" TEXT NOT NULL,
ADD COLUMN     "insuranceCarrier" TEXT,
ADD COLUMN     "insuranceType" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "physicianName" TEXT,
ADD COLUMN     "specialAssistance" TEXT[];

-- AlterTable
ALTER TABLE "lab_packages" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recommendedFor" TEXT NOT NULL,
ADD COLUMN     "tagline" TEXT NOT NULL,
ADD COLUMN     "testCount" INTEGER NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "originalValue" SET NOT NULL,
ALTER COLUMN "fastingRequired" DROP DEFAULT,
ALTER COLUMN "turnaroundTime" SET NOT NULL;

-- AlterTable
ALTER TABLE "lab_tests" ADD COLUMN     "categoryLabel" TEXT NOT NULL,
ADD COLUMN     "clinicalSignificance" TEXT NOT NULL,
ADD COLUMN     "commonFor" TEXT[],
ADD COLUMN     "popular" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "turnaroundTime" SET NOT NULL,
ALTER COLUMN "specimenType" SET NOT NULL;

-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "fax" TEXT NOT NULL,
ADD COLUMN     "hasDrawSite" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "hasParking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasWheelchairAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hoursSaturday" TEXT NOT NULL,
ADD COLUMN     "hoursSunday" TEXT NOT NULL,
ADD COLUMN     "hoursWeekday" TEXT NOT NULL,
ADD COLUMN     "specialNotes" TEXT,
ADD COLUMN     "transitInfo" TEXT NOT NULL,
ALTER COLUMN "shortName" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;
