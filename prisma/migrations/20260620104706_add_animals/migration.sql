-- AlterTable
ALTER TABLE "QuickCustomer" ADD COLUMN "animalAge" TEXT;

-- AlterTable
ALTER TABLE "TestCatalog" ADD COLUMN "animalIds" TEXT;
ALTER TABLE "TestCatalog" ADD COLUMN "maxNormalOld" REAL;
ALTER TABLE "TestCatalog" ADD COLUMN "minNormalOld" REAL;

-- CreateTable
CREATE TABLE "Animal" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "icon" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "clinicId" TEXT,
    "quickReportId" TEXT,
    "subTotal" REAL NOT NULL,
    "vatRate" REAL NOT NULL DEFAULT 0.15,
    "vatAmount" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Unpaid',
    "dueDate" DATETIME,
    "notes" TEXT,
    "zatcaQr" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic" ("_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Invoice_quickReportId_fkey" FOREIGN KEY ("quickReportId") REFERENCES "QuickReport" ("_id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("_id", "clinicId", "createdAt", "dueDate", "invoiceNumber", "notes", "paidAmount", "status", "subTotal", "totalAmount", "updatedAt", "vatAmount", "vatRate", "zatcaQr") SELECT "_id", "clinicId", "createdAt", "dueDate", "invoiceNumber", "notes", "paidAmount", "status", "subTotal", "totalAmount", "updatedAt", "vatAmount", "vatRate", "zatcaQr" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE UNIQUE INDEX "Invoice_quickReportId_key" ON "Invoice"("quickReportId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
