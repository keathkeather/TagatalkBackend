/*
  Warnings:

  - You are about to drop the column `gameLesson` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `gameLevel` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `gameName` on the `Game` table. All the data in the column will be lost.
  - Added the required column `gameLessonNumber` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "gameLesson",
DROP COLUMN "gameLevel",
DROP COLUMN "gameName",
ADD COLUMN     "gameLessonNumber" INTEGER NOT NULL;
