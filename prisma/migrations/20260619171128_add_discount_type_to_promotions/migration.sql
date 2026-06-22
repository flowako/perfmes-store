/*
  Warnings:

  - You are about to drop the column `discountedPrice` on the `Promotion` table. All the data in the column will be lost.
  - Added the required column `discountValue` to the `Promotion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "discountedPrice",
ADD COLUMN     "discountType" TEXT NOT NULL DEFAULT 'percentage',
ADD COLUMN     "discountValue" DECIMAL(10,2) NOT NULL;
