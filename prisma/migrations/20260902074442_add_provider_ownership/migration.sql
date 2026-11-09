-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "providerId" TEXT;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "staff_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
