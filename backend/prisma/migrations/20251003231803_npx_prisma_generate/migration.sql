-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Darbas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "type" TEXT,
    "description" TEXT,
    "responsibilities" JSONB NOT NULL,
    "salary" TEXT,
    "postedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Darbas" ("description", "id", "location", "postedAt", "responsibilities", "salary", "title", "type", "updatedAt") SELECT "description", "id", "location", "postedAt", "responsibilities", "salary", "title", "type", "updatedAt" FROM "Darbas";
DROP TABLE "Darbas";
ALTER TABLE "new_Darbas" RENAME TO "Darbas";
CREATE UNIQUE INDEX "Darbas_title_key" ON "Darbas"("title");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
