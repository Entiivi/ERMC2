-- AlterTable
ALTER TABLE "Projektas" ADD COLUMN "actualAddress" TEXT;
ALTER TABLE "Projektas" ADD COLUMN "address" TEXT;
ALTER TABLE "Projektas" ADD COLUMN "electricityNotes" TEXT;
ALTER TABLE "Projektas" ADD COLUMN "estimatedKwhPerMonth" REAL;
ALTER TABLE "Projektas" ADD COLUMN "lat" REAL;
ALTER TABLE "Projektas" ADD COLUMN "lng" REAL;

-- CreateTable
CREATE TABLE "ElectricityProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProjektasElectricityProvider" (
    "projektasId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "note" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("projektasId", "providerId"),
    CONSTRAINT "ProjektasElectricityProvider_projektasId_fkey" FOREIGN KEY ("projektasId") REFERENCES "Projektas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjektasElectricityProvider_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ElectricityProvider" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProjektasWorker" (
    "projektasId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "position" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,

    PRIMARY KEY ("projektasId", "workerId"),
    CONSTRAINT "ProjektasWorker_projektasId_fkey" FOREIGN KEY ("projektasId") REFERENCES "Projektas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjektasWorker_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ElectricityProvider_name_key" ON "ElectricityProvider"("name");

-- CreateIndex
CREATE INDEX "ProjektasElectricityProvider_providerId_idx" ON "ProjektasElectricityProvider"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_email_key" ON "Worker"("email");

-- CreateIndex
CREATE INDEX "ProjektasWorker_workerId_idx" ON "ProjektasWorker"("workerId");
