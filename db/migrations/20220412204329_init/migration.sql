-- CreateEnum
CREATE TYPE "PersonTeam" AS ENUM ('BLUE', 'RED');

-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('MEMBER', 'GUEST');

-- CreateTable
CREATE TABLE "Expeditie" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "linkName" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,
    "showMap" BOOLEAN NOT NULL DEFAULT false,
    "showMovie" BOOLEAN NOT NULL DEFAULT false,
    "countries" TEXT[],
    "backgroundFileId" INTEGER NOT NULL,

    CONSTRAINT "Expeditie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "type" "PersonType" NOT NULL DEFAULT E'MEMBER',
    "team" "PersonTeam",
    "ldapId" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaFile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "restricted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MediaFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeoNode" (
    "id" SERIAL NOT NULL,
    "expeditieId" INTEGER NOT NULL,
    "beginTimestamp" INTEGER NOT NULL DEFAULT 0,
    "endTimestamp" INTEGER NOT NULL DEFAULT 2147483647,

    CONSTRAINT "GeoNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeoLocation" (
    "id" SERIAL NOT NULL,
    "expeditieId" INTEGER NOT NULL,
    "personId" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT E'Europe/Amsterdam',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "elevation" DOUBLE PRECISION,

    CONSTRAINT "GeoLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "definitions" TEXT[],
    "phonetic" TEXT,
    "attachmentId" INTEGER,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" SERIAL NOT NULL,
    "quote" TEXT NOT NULL,
    "quotee" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT E'Europe/Amsterdam',
    "attachmentId" INTEGER,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ExpeditieParticipant" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ExpeditieMovieEditor" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_GeoNodeToPerson" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Expeditie_linkName_key" ON "Expeditie"("linkName");

-- CreateIndex
CREATE INDEX "Expeditie_linkName_idx" ON "Expeditie"("linkName");

-- CreateIndex
CREATE INDEX "Expeditie_sequenceNumber_idx" ON "Expeditie"("sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Person_username_key" ON "Person"("username");

-- CreateIndex
CREATE INDEX "Person_lastName_firstName_idx" ON "Person"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "Person_lastName_initials_idx" ON "Person"("lastName", "initials");

-- CreateIndex
CREATE INDEX "Person_username_idx" ON "Person"("username");

-- CreateIndex
CREATE UNIQUE INDEX "MediaFile_name_key" ON "MediaFile"("name");

-- CreateIndex
CREATE INDEX "GeoNode_expeditieId_endTimestamp_idx" ON "GeoNode"("expeditieId", "endTimestamp");

-- CreateIndex
CREATE INDEX "GeoLocation_expeditieId_id_idx" ON "GeoLocation"("expeditieId", "id");

-- CreateIndex
CREATE INDEX "GeoLocation_expeditieId_personId_idx" ON "GeoLocation"("expeditieId", "personId");

-- CreateIndex
CREATE INDEX "GeoLocation_personId_timestamp_idx" ON "GeoLocation"("personId", "timestamp");

-- CreateIndex
CREATE INDEX "GeoLocation_timestamp_idx" ON "GeoLocation"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "GeoLocation_expeditieId_personId_timestamp_key" ON "GeoLocation"("expeditieId", "personId", "timestamp");

-- CreateIndex
CREATE INDEX "Word_word_idx" ON "Word"("word");

-- CreateIndex
CREATE INDEX "Quote_timestamp_idx" ON "Quote"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "_ExpeditieParticipant_AB_unique" ON "_ExpeditieParticipant"("A", "B");

-- CreateIndex
CREATE INDEX "_ExpeditieParticipant_B_index" ON "_ExpeditieParticipant"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ExpeditieMovieEditor_AB_unique" ON "_ExpeditieMovieEditor"("A", "B");

-- CreateIndex
CREATE INDEX "_ExpeditieMovieEditor_B_index" ON "_ExpeditieMovieEditor"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GeoNodeToPerson_AB_unique" ON "_GeoNodeToPerson"("A", "B");

-- CreateIndex
CREATE INDEX "_GeoNodeToPerson_B_index" ON "_GeoNodeToPerson"("B");

-- AddForeignKey
ALTER TABLE "Expeditie" ADD CONSTRAINT "Expeditie_backgroundFileId_fkey" FOREIGN KEY ("backgroundFileId") REFERENCES "MediaFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoNode" ADD CONSTRAINT "GeoNode_expeditieId_fkey" FOREIGN KEY ("expeditieId") REFERENCES "Expeditie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoLocation" ADD CONSTRAINT "GeoLocation_expeditieId_fkey" FOREIGN KEY ("expeditieId") REFERENCES "Expeditie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoLocation" ADD CONSTRAINT "GeoLocation_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "MediaFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "MediaFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExpeditieParticipant" ADD FOREIGN KEY ("A") REFERENCES "Expeditie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExpeditieParticipant" ADD FOREIGN KEY ("B") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExpeditieMovieEditor" ADD FOREIGN KEY ("A") REFERENCES "Expeditie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExpeditieMovieEditor" ADD FOREIGN KEY ("B") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeoNodeToPerson" ADD FOREIGN KEY ("A") REFERENCES "GeoNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeoNodeToPerson" ADD FOREIGN KEY ("B") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
