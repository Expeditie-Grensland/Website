/*
  Warnings:

  - You are about to drop the column `linkName` on the `Expeditie` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Expeditie` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Expeditie` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Expeditie_linkName_idx";

-- DropIndex
DROP INDEX "Expeditie_linkName_key";

-- AlterTable
ALTER TABLE "Expeditie" RENAME COLUMN "linkName" TO "slug";

-- CreateIndex
CREATE UNIQUE INDEX "Expeditie_slug_key" ON "Expeditie"("slug");

-- CreateIndex
CREATE INDEX "Expeditie_slug_idx" ON "Expeditie"("slug");
