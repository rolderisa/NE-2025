-- CreateTable
CREATE TABLE "VehicleEntry" (
    "id" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "parkingCode" TEXT NOT NULL,
    "entryDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitDateTime" TIMESTAMP(3),
    "chargedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "VehicleEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleEntry_parkingCode_key" ON "VehicleEntry"("parkingCode");

-- CreateIndex
CREATE INDEX "VehicleEntry_vehicleId_idx" ON "VehicleEntry"("vehicleId");

-- CreateIndex
CREATE INDEX "VehicleEntry_userId_idx" ON "VehicleEntry"("userId");

-- CreateIndex
CREATE INDEX "VehicleEntry_parkingCode_idx" ON "VehicleEntry"("parkingCode");

-- AddForeignKey
ALTER TABLE "VehicleEntry" ADD CONSTRAINT "VehicleEntry_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleEntry" ADD CONSTRAINT "VehicleEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
