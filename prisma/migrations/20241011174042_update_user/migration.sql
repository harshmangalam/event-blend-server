/*
  Warnings:

  - You are about to alter the column `name` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `bio` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(250)`.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "bio" SET DATA TYPE VARCHAR(250);
