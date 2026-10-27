-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "motel_id" TEXT;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_motel_id_fkey" FOREIGN KEY ("motel_id") REFERENCES "motels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
