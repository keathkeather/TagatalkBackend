/*
  Warnings:

  - A unique constraint covering the columns `[recovery_token]` on the table `Auth` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Auth_recovery_token_key" ON "Auth"("recovery_token");
