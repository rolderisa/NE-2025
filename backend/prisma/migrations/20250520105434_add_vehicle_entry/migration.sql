/*
  Warnings:

  - You are about to drop the column `planId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the `PaymentPlan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_planId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "planId";

-- DropTable
DROP TABLE "PaymentPlan";
