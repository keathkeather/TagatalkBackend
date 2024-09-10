-- AlterTable
ALTER TABLE "Game_Assets" ADD COLUMN     "textContent" TEXT,
ALTER COLUMN "fileUrl" DROP NOT NULL;
