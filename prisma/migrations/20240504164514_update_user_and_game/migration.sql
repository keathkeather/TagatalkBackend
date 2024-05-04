/*
  Warnings:

  - Added the required column `gameChapter` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "gameChapter" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileDescription" TEXT,
ADD COLUMN     "profileImage" TEXT;
