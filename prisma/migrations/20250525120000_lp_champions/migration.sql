-- AlterTable
ALTER TABLE "Player" ADD COLUMN "championStats" JSONB;

-- CreateTable
CREATE TABLE "LpSnapshot" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "lpNet" INTEGER NOT NULL,
    "tier" TEXT,
    "division" TEXT,
    "lp" INTEGER,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LpSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LpSnapshot_playerId_recordedAt_idx" ON "LpSnapshot"("playerId", "recordedAt");

-- AddForeignKey
ALTER TABLE "LpSnapshot" ADD CONSTRAINT "LpSnapshot_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
