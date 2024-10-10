/*
  Warnings:

  - You are about to drop the column `gameId` on the `User_Progress` table. All the data in the column will be lost.
  - Added the required column `lessonId` to the `User_Progress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User_Progress" DROP CONSTRAINT "User_Progress_gameId_fkey";

-- AlterTable
ALTER TABLE "User_Progress" DROP COLUMN "gameId",
ADD COLUMN     "lessonId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "User_Progress" ADD CONSTRAINT "User_Progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
