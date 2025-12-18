-- CreateTable
CREATE TABLE "ProjektasMaterial" (
    "projektasId" TEXT NOT NULL,
    "materialKey" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("projektasId", "materialKey"),
    CONSTRAINT "ProjektasMaterial_projektasId_fkey" FOREIGN KEY ("projektasId") REFERENCES "Projektas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ProjektasMaterial_materialKey_idx" ON "ProjektasMaterial"("materialKey");
