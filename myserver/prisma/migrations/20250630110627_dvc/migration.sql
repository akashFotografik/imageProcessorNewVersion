-- AlterTable
ALTER TABLE "transaction_history" ADD COLUMN     "enabledById" TEXT,
ADD COLUMN     "numberOfDaysUsed" INTEGER,
ADD COLUMN     "serviceId" TEXT;

-- AddForeignKey
ALTER TABLE "transaction_history" ADD CONSTRAINT "transaction_history_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_history" ADD CONSTRAINT "transaction_history_enabledById_fkey" FOREIGN KEY ("enabledById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
