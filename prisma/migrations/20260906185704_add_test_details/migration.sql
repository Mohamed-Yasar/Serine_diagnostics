-- AlterTable
ALTER TABLE "lab_tests" ADD COLUMN     "abnormalSymptoms" TEXT,
ADD COLUMN     "collectionKit" TEXT,
ADD COLUMN     "importantInformation" TEXT,
ADD COLUMN     "patientPreparation" TEXT,
ADD COLUMN     "relatedTests" TEXT[],
ADD COLUMN     "specimenVolume" TEXT,
ADD COLUMN     "whatItHelpsEvaluate" TEXT,
ADD COLUMN     "whyItIsDone" TEXT;
