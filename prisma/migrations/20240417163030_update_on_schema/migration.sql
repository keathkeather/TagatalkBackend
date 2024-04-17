-- AlterTable
ALTER TABLE "Feedback" ALTER COLUMN "isDeleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "isDeleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Game_Assets" ALTER COLUMN "isDeleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "isDeleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "isDeleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "userStreak" SET DEFAULT 0,
ALTER COLUMN "isDeleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "User_Progress" ALTER COLUMN "isDeleted" SET DEFAULT false;
