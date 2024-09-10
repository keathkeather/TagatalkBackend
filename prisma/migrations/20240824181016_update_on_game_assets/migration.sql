/*
  Warnings:

  - Added the required column `assetClassifier` to the `Game_Assets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game_Assets" ADD COLUMN     "assetClassifier" TEXT NOT NULL;
