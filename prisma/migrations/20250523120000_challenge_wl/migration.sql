-- AlterTable
ALTER TABLE "Player" ADD COLUMN "winsAtStart" INTEGER;
ALTER TABLE "Player" ADD COLUMN "lossesAtStart" INTEGER;

-- Joueurs déjà inscrits : baseline = stats actuelles (W/L défi à partir du déploiement)
UPDATE "Player"
SET "winsAtStart" = COALESCE("wins", 0),
    "lossesAtStart" = COALESCE("losses", 0)
WHERE "winsAtStart" IS NULL;
