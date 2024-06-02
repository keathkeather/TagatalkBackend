-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "gameValue" SET DEFAULT 100;

-- AlterTable
ALTER TABLE "Lesson" ALTER COLUMN "lessonNumber" DROP DEFAULT;
DROP SEQUENCE "Lesson_lessonNumber_seq";

-- AlterTable
ALTER TABLE "Unit" ALTER COLUMN "unitNumber" DROP DEFAULT;
DROP SEQUENCE "Unit_unitNumber_seq";
