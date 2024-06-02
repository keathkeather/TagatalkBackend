/*
  Warnings:

  - The values [CONTENTMANAGER] on the enum `role` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `skillId` to the `Unit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "role_new" AS ENUM ('ADMIN', 'CONTENT_EDITOR', 'USER');
ALTER TABLE "Auth" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Auth" ALTER COLUMN "role" TYPE "role_new" USING ("role"::text::"role_new");
ALTER TYPE "role" RENAME TO "role_old";
ALTER TYPE "role_new" RENAME TO "role";
DROP TYPE "role_old";
ALTER TABLE "Auth" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "skillId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "Skill" (
    "id" UUID NOT NULL,
    "skillName" TEXT NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
