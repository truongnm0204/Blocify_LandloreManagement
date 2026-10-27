-- AlterTable
ALTER TABLE "motels" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
