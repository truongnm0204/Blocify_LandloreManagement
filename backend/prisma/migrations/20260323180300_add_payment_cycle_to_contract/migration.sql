-- CreateEnum
CREATE TYPE "PaymentCycle" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "payment_cycle" "PaymentCycle" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN     "payment_day" INTEGER;
