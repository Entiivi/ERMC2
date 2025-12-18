-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ElectricityProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SUPPLIER',
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ElectricityProvider" ("createdAt", "email", "id", "name", "phone", "updatedAt", "website") SELECT "createdAt", "email", "id", "name", "phone", "updatedAt", "website" FROM "ElectricityProvider";
DROP TABLE "ElectricityProvider";
ALTER TABLE "new_ElectricityProvider" RENAME TO "ElectricityProvider";
CREATE UNIQUE INDEX "ElectricityProvider_name_key" ON "ElectricityProvider"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
