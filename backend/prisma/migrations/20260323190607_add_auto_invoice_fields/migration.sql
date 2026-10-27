-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "auto_generated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "motels" ADD COLUMN     "auto_invoice" BOOLEAN NOT NULL DEFAULT false;
