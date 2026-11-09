-- CreateTable
CREATE TABLE "lab_results" (
    "id" TEXT NOT NULL,
    "labOrderTestId" TEXT NOT NULL,
    "resultValue" TEXT,
    "units" TEXT,
    "referenceRange" TEXT,
    "resultStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "comments" TEXT,
    "performedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lab_results_labOrderTestId_key" ON "lab_results"("labOrderTestId");

-- AddForeignKey
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_labOrderTestId_fkey" FOREIGN KEY ("labOrderTestId") REFERENCES "lab_order_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
