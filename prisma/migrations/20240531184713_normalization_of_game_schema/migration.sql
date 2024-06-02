/*
  Warnings:

  - You are about to drop the column `gameLesson` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `gameLessonNumber` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `gameUnit` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `gameUnitNumber` on the `Game` table. All the data in the column will be lost.
  - Added the required column `lessonId` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "gameLesson",
DROP COLUMN "gameLessonNumber",
DROP COLUMN "gameUnit",
DROP COLUMN "gameUnitNumber",
ADD COLUMN     "lessonId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "Unit" (
    "id" UUID NOT NULL,
    "unitNumber" SERIAL NOT NULL,
    "unitName" TEXT NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" UUID NOT NULL,
    "lessonNumber" SERIAL NOT NULL,
    "lessonName" TEXT NOT NULL,
    "unitId" UUID NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
