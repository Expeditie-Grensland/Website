-- CreateTable
CREATE TABLE "MemberLink" (
    "id" SERIAL NOT NULL,
    "index" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "link" TEXT,
    "adminLink" TEXT,

    CONSTRAINT "MemberLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemberLink_index_idx" ON "MemberLink"("index");
