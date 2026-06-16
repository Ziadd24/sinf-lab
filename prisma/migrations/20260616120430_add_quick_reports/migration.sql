-- CreateTable
CREATE TABLE "QuickCustomer" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "animalType" TEXT NOT NULL,
    "animalName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "QuickReport" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "resultsJson" TEXT NOT NULL,
    "doctorNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuickReport_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "QuickCustomer" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "QuickCustomer_phone_idx" ON "QuickCustomer"("phone");

-- CreateIndex
CREATE INDEX "QuickCustomer_name_idx" ON "QuickCustomer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "QuickReport_reportId_key" ON "QuickReport"("reportId");

-- CreateIndex
CREATE INDEX "QuickReport_customerId_idx" ON "QuickReport"("customerId");

-- CreateIndex
CREATE INDEX "QuickReport_createdAt_idx" ON "QuickReport"("createdAt");
