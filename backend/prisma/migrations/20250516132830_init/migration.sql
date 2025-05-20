-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "PasswordResetStatus" AS ENUM ('IDLE', 'REQUESTED', 'COMPLETED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password_reset_code" TEXT,
ADD COLUMN     "password_reset_expires" TIMESTAMP(3),
ADD COLUMN     "password_reset_status" "PasswordResetStatus" NOT NULL DEFAULT 'IDLE',
ADD COLUMN     "verification_code" TEXT,
ADD COLUMN     "verification_expires" TIMESTAMP(3),
ADD COLUMN     "verification_status" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED';
