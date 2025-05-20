-- AlterTable
ALTER TABLE "ParkingSlot" ADD COLUMN     "available_spaces" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "charge_per_hour" DOUBLE PRECISION NOT NULL DEFAULT 2000.0,
ADD COLUMN     "parking_name" TEXT;
