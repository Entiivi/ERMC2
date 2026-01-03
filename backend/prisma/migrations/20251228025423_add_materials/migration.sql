-- CreateTable
CREATE TABLE "Material" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "brand" TEXT,
    "sku" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MaterialPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "materialKey" TEXT NOT NULL,
    "supplier" TEXT,
    "price" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "vatRate" DECIMAL,
    "validFrom" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MaterialPrice_materialKey_fkey" FOREIGN KEY ("materialKey") REFERENCES "Material" ("key") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProjektasMaterial" (
    "projektasId" TEXT NOT NULL,
    "materialKey" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL,
    "vatRate" DECIMAL,
    "currency" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("projektasId", "materialKey"),
    CONSTRAINT "ProjektasMaterial_projektasId_fkey" FOREIGN KEY ("projektasId") REFERENCES "Projektas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjektasMaterial_materialKey_fkey" FOREIGN KEY ("materialKey") REFERENCES "Material" ("key") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProjektasMaterial" ("createdAt", "materialKey", "projektasId", "quantity", "updatedAt") SELECT "createdAt", "materialKey", "projektasId", "quantity", "updatedAt" FROM "ProjektasMaterial";
DROP TABLE "ProjektasMaterial";
ALTER TABLE "new_ProjektasMaterial" RENAME TO "ProjektasMaterial";
CREATE INDEX "ProjektasMaterial_materialKey_idx" ON "ProjektasMaterial"("materialKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Material_sku_key" ON "Material"("sku");

-- CreateIndex
CREATE INDEX "Material_name_idx" ON "Material"("name");

-- CreateIndex
CREATE INDEX "Material_category_idx" ON "Material"("category");

-- CreateIndex
CREATE INDEX "Material_isActive_idx" ON "Material"("isActive");

-- CreateIndex
CREATE INDEX "MaterialPrice_materialKey_validFrom_idx" ON "MaterialPrice"("materialKey", "validFrom");

-- CreateIndex
CREATE INDEX "MaterialPrice_materialKey_validTo_idx" ON "MaterialPrice"("materialKey", "validTo");
