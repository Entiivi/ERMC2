-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Apie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lang" TEXT NOT NULL DEFAULT 'LT',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Apie" ("content", "id", "order", "title", "updatedAt") SELECT "content", "id", "order", "title", "updatedAt" FROM "Apie";
DROP TABLE "Apie";
ALTER TABLE "new_Apie" RENAME TO "Apie";
CREATE UNIQUE INDEX "Apie_title_key" ON "Apie"("title");
CREATE TABLE "new_Darbas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lang" TEXT NOT NULL DEFAULT 'LT',
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
CREATE TABLE "new_Kontaktas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lang" TEXT NOT NULL DEFAULT 'LT',
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "copyable" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Kontaktas" ("copyable", "createdAt", "icon", "id", "label", "updatedAt", "value") SELECT "copyable", "createdAt", "icon", "id", "label", "updatedAt", "value" FROM "Kontaktas";
DROP TABLE "Kontaktas";
ALTER TABLE "new_Kontaktas" RENAME TO "Kontaktas";
CREATE UNIQUE INDEX "Kontaktas_label_key" ON "Kontaktas"("label");
CREATE TABLE "new_Partneris" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lang" TEXT NOT NULL DEFAULT 'LT',
    "name" TEXT NOT NULL,
    "imageSrc" TEXT NOT NULL,
    "imageAlt" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Partneris" ("createdAt", "id", "imageAlt", "imageSrc", "name", "updatedAt") SELECT "createdAt", "id", "imageAlt", "imageSrc", "name", "updatedAt" FROM "Partneris";
DROP TABLE "Partneris";
ALTER TABLE "new_Partneris" RENAME TO "Partneris";
CREATE UNIQUE INDEX "Partneris_name_key" ON "Partneris"("name");
CREATE TABLE "new_Paslauga" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lang" TEXT NOT NULL DEFAULT 'LT',
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Paslauga" ("createdAt", "details", "iconUrl", "id", "subtitle", "title", "updatedAt") SELECT "createdAt", "details", "iconUrl", "id", "subtitle", "title", "updatedAt" FROM "Paslauga";
DROP TABLE "Paslauga";
ALTER TABLE "new_Paslauga" RENAME TO "Paslauga";
CREATE UNIQUE INDEX "Paslauga_title_key" ON "Paslauga"("title");
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Projektas" ("cover", "createdAt", "date", "excerpt", "id", "link", "logoUrl", "tech", "title", "updatedAt") SELECT "cover", "createdAt", "date", "excerpt", "id", "link", "logoUrl", "tech", "title", "updatedAt" FROM "Projektas";
DROP TABLE "Projektas";
ALTER TABLE "new_Projektas" RENAME TO "Projektas";
CREATE UNIQUE INDEX "Projektas_title_key" ON "Projektas"("title");
CREATE TABLE "new_Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lang" TEXT NOT NULL DEFAULT 'LT',
    "name" TEXT NOT NULL
);
INSERT INTO "new_Tag" ("id", "name") SELECT "id", "name" FROM "Tag";
DROP TABLE "Tag";
ALTER TABLE "new_Tag" RENAME TO "Tag";
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
