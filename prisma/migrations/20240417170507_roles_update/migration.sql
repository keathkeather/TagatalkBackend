/*
  Warnings:

  - The `role` column on the `Auth` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "role" AS ENUM ('ADMIN', 'CONTENTMANAGER', 'USER');

-- AlterTable
ALTER TABLE "Auth" DROP COLUMN "role",
ADD COLUMN     "role" "role" NOT NULL DEFAULT 'USER';
