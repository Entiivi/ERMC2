/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Apie` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Apie_title_key" ON "Apie"("title");
