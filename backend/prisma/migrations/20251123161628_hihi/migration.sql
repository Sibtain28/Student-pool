/*
  Warnings:

  - A unique constraint covering the columns `[rideId,userId]` on the table `RideParticipant` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "RideJoinRequest" DROP CONSTRAINT "RideJoinRequest_rideId_fkey";

-- DropForeignKey
ALTER TABLE "RideParticipant" DROP CONSTRAINT "RideParticipant_rideId_fkey";

-- DropForeignKey
ALTER TABLE "RideReview" DROP CONSTRAINT "RideReview_rideId_fkey";

-- AlterTable
ALTER TABLE "Ride" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE UNIQUE INDEX "RideParticipant_rideId_userId_key" ON "RideParticipant"("rideId", "userId");

-- AddForeignKey
ALTER TABLE "RideJoinRequest" ADD CONSTRAINT "RideJoinRequest_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideParticipant" ADD CONSTRAINT "RideParticipant_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideReview" ADD CONSTRAINT "RideReview_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;
