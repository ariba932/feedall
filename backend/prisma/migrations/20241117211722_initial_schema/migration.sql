-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('DONOR', 'SERVICE_PROVIDER', 'NGO', 'LOGISTICS', 'VOLUNTEER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DonationType" AS ENUM ('DIRECT', 'PACK_SPONSORSHIP', 'NGO_NEED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'PREPARING', 'IN_TRANSIT', 'DELIVERED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "ImpactCategory" AS ENUM ('MEALS_SERVED', 'WASTE_REDUCED', 'COMMUNITY_ENGAGEMENT', 'EDUCATION', 'HEALTH', 'ENVIRONMENT', 'ECONOMIC');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'DONOR',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "avatar" TEXT,
    "bio" TEXT,
    "companyName" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationDocuments" JSONB,
    "preferences" JSONB DEFAULT '{}',
    "impactPoints" INTEGER NOT NULL DEFAULT 0,
    "lastLogin" TIMESTAMP(3),
    "failedLogins" INTEGER NOT NULL DEFAULT 0,
    "resetToken" TEXT,
    "resetTokenExp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "type" "DonationType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "frequency" TEXT,
    "duration" INTEGER,
    "status" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "providerId" TEXT,
    "ngoId" TEXT,
    "paymentId" TEXT,
    "paymentStatus" TEXT,
    "beneficiaries" INTEGER,
    "impact" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_packs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "contents" JSONB NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "deliveryZones" TEXT[],
    "minOrder" INTEGER NOT NULL,
    "deliveryTime" JSONB NOT NULL,
    "providerId" TEXT NOT NULL,
    "isSponsored" BOOLEAN NOT NULL DEFAULT false,
    "sponsorId" TEXT,
    "availableQuantity" INTEGER NOT NULL,
    "sponsoredQuantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feeding_needs" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "beneficiaries" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "mealsPerDay" INTEGER NOT NULL,
    "totalMeals" INTEGER NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "evidence" JSONB NOT NULL,
    "coordinates" JSONB NOT NULL,
    "ngoId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "fundingProgress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feeding_needs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveries" (
    "id" TEXT NOT NULL,
    "status" "DeliveryStatus" NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "dropoffLocation" TEXT NOT NULL,
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "actualTime" TIMESTAMP(3),
    "logisticsId" TEXT NOT NULL,
    "evidence" JSONB,
    "gpsData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "evidence" JSONB,
    "notes" TEXT,
    "volunteerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "impacts" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "category" "ImpactCategory" NOT NULL,
    "metrics" JSONB NOT NULL,
    "evidence" JSONB,
    "location" JSONB NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "beneficiaries" JSONB NOT NULL,
    "sdgGoals" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "impacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smart_contracts" (
    "id" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "contractType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "abi" JSONB NOT NULL,
    "bytecode" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "donationId" TEXT,
    "foodPackId" TEXT,
    "feedingNeedId" TEXT,
    "deliveryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "smart_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "impacts_entityId_entityType_idx" ON "impacts"("entityId", "entityType");

-- CreateIndex
CREATE INDEX "impacts_category_idx" ON "impacts"("category");

-- CreateIndex
CREATE INDEX "impacts_date_idx" ON "impacts"("date");

-- CreateIndex
CREATE UNIQUE INDEX "smart_contracts_contractAddress_key" ON "smart_contracts"("contractAddress");

-- CreateIndex
CREATE UNIQUE INDEX "smart_contracts_donationId_key" ON "smart_contracts"("donationId");

-- CreateIndex
CREATE UNIQUE INDEX "smart_contracts_foodPackId_key" ON "smart_contracts"("foodPackId");

-- CreateIndex
CREATE UNIQUE INDEX "smart_contracts_feedingNeedId_key" ON "smart_contracts"("feedingNeedId");

-- CreateIndex
CREATE UNIQUE INDEX "smart_contracts_deliveryId_key" ON "smart_contracts"("deliveryId");

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_packs" ADD CONSTRAINT "food_packs_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_packs" ADD CONSTRAINT "food_packs_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feeding_needs" ADD CONSTRAINT "feeding_needs_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_logisticsId_fkey" FOREIGN KEY ("logisticsId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smart_contracts" ADD CONSTRAINT "smart_contracts_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "donations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smart_contracts" ADD CONSTRAINT "smart_contracts_foodPackId_fkey" FOREIGN KEY ("foodPackId") REFERENCES "food_packs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smart_contracts" ADD CONSTRAINT "smart_contracts_feedingNeedId_fkey" FOREIGN KEY ("feedingNeedId") REFERENCES "feeding_needs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smart_contracts" ADD CONSTRAINT "smart_contracts_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
