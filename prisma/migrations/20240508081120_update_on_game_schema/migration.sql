/*
  Warnings:

  - You are about to drop the column `gameChapter` on the `Game` table. All the data in the column will be lost.
  - Added the required column `gameLesson` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameSkill` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameUnit` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameUnitNumber` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gamelesson` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "gameChapter",
ADD COLUMN     "gameLesson" INTEGER NOT NULL,
ADD COLUMN     "gameSkill" TEXT NOT NULL,
ADD COLUMN     "gameUnit" TEXT NOT NULL,
ADD COLUMN     "gameUnitNumber" INTEGER NOT NULL,
ADD COLUMN     "gamelesson" TEXT NOT NULL;
