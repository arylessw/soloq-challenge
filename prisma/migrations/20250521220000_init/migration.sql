-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "tagLine" TEXT NOT NULL,
    "puuid" TEXT,
    "summonerId" TEXT,
    "startTier" TEXT NOT NULL,
    "startDivision" TEXT NOT NULL,
    "startLp" INTEGER NOT NULL DEFAULT 0,
    "currentTier" TEXT,
    "currentDivision" TEXT,
    "currentLp" INTEGER,
    "wins" INTEGER,
    "losses" INTEGER,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_gameName_tagLine_key" ON "Player"("gameName", "tagLine");
