/*
  Warnings:

  - You are about to drop the column `currencyId` on the `Stamp` table. All the data in the column will be lost.
  - You are about to drop the column `denomination` on the `Stamp` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Stamp" DROP CONSTRAINT "Stamp_currencyId_fkey";

-- DropIndex
DROP INDEX "Stamp_currencyId_idx";

-- AlterTable
ALTER TABLE "Stamp" DROP COLUMN "currencyId",
DROP COLUMN "denomination",
ALTER COLUMN "faceValue" SET DATA TYPE TEXT;
