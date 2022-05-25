-- CreateTable
CREATE TABLE "EarnedPoint" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT E'Europe/Amsterdam',
    "personId" INTEGER NOT NULL,
    "expeditieId" INTEGER NOT NULL,

    CONSTRAINT "EarnedPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EarnedPoint_timestamp_idx" ON "EarnedPoint"("timestamp");

-- AddForeignKey
ALTER TABLE "EarnedPoint" ADD CONSTRAINT "EarnedPoint_expeditieId_fkey" FOREIGN KEY ("expeditieId") REFERENCES "Expeditie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarnedPoint" ADD CONSTRAINT "EarnedPoint_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
