-- DropForeignKey
ALTER TABLE "EarnedPoint" DROP CONSTRAINT "EarnedPoint_expeditieId_fkey";

-- AlterTable
ALTER TABLE "EarnedPoint" ALTER COLUMN "expeditieId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "EarnedPoint" ADD CONSTRAINT "EarnedPoint_expeditieId_fkey" FOREIGN KEY ("expeditieId") REFERENCES "Expeditie"("id") ON DELETE SET NULL ON UPDATE CASCADE;
