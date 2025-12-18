/*
  Warnings:

  - You are about to drop the column `actualAddress` on the `Projektas` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "LtMaterialIndex" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "group" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Projektas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lang" TEXT NOT NULL DEFAULT 'LT',
    "title" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "cover" TEXT NOT NULL,
    "logoUrl" TEXT,
    "tech" JSONB NOT NULL,
    "excerpt" TEXT,
    "link" TEXT,
    "client" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "address" TEXT,
    "lat" REAL,
    "lng" REAL,
    "estimatedKwhPerMonth" REAL,
    "electricityNotes" TEXT
);
INSERT INTO "new_Projektas" ("address", "client", "cover", "createdAt", "date", "electricityNotes", "estimatedKwhPerMonth", "excerpt", "id", "lang", "lat", "link", "lng", "logoUrl", "tech", "title", "updatedAt") SELECT "address", "client", "cover", "createdAt", "date", "electricityNotes", "estimatedKwhPerMonth", "excerpt", "id", "lang", "lat", "link", "lng", "logoUrl", "tech", "title", "updatedAt" FROM "Projektas";
DROP TABLE "Projektas";
ALTER TABLE "new_Projektas" RENAME TO "Projektas";
CREATE UNIQUE INDEX "Projektas_title_key" ON "Projektas"("title");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "LtMaterialIndex_group_period_idx" ON "LtMaterialIndex"("group", "period");

-- CreateIndex
CREATE UNIQUE INDEX "LtMaterialIndex_group_period_key" ON "LtMaterialIndex"("group", "period");
