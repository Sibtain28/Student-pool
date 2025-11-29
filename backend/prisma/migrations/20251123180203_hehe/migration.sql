/*
  Warnings:

  - The `status` column on the `RideJoinRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[rideId,requesterId]` on the table `RideJoinRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rideId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costPerPerson` to the `Ride` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seatsAvailable` to the `Ride` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCost` to the `Ride` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RideJoinRequest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RideJoinRequestStatus" AS ENUM ('pending', 'accepted', 'declined');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('join_request', 'new_ride', 'request_accepted', 'request_declined', 'ride_updated', 'ride_cancelled');

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "requesterId" INTEGER,
ADD COLUMN     "rideId" INTEGER NOT NULL,
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- AlterTable
ALTER TABLE "Ride" ADD COLUMN     "costPerPerson" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "seatsAvailable" INTEGER NOT NULL,
ADD COLUMN     "totalCost" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "RideJoinRequest" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "RideJoinRequestStatus" NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_rideId_idx" ON "Notification"("rideId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "RideJoinRequest_rideId_idx" ON "RideJoinRequest"("rideId");

-- CreateIndex
CREATE INDEX "RideJoinRequest_requesterId_idx" ON "RideJoinRequest"("requesterId");

-- CreateIndex
CREATE UNIQUE INDEX "RideJoinRequest_rideId_requesterId_key" ON "RideJoinRequest"("rideId", "requesterId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
