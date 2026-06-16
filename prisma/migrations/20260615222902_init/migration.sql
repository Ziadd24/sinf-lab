-- CreateTable
CREATE TABLE "Species" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Clinic" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "clinicName" TEXT NOT NULL,
    "clinicNameAr" TEXT,
    "taxNumber" TEXT,
    "commercialRegister" TEXT,
    "contactName" TEXT,
    "contactNameAr" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "addressAr" TEXT,
    "city" TEXT,
    "cityAr" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Pet" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "speciesId" TEXT NOT NULL,
    "breed" TEXT,
    "breedAr" TEXT,
    "birthDate" DATETIME,
    "gender" TEXT NOT NULL DEFAULT 'Unknown',
    "chipNumber" TEXT,
    "ownerId" TEXT,
    "ownerName" TEXT,
    "ownerNameAr" TEXT,
    "ownerPhone" TEXT,
    "clinicId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pet_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pet_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic" ("_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestCatalog" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "testCode" TEXT NOT NULL,
    "testNameEn" TEXT NOT NULL,
    "testNameAr" TEXT NOT NULL,
    "category" TEXT,
    "categoryAr" TEXT,
    "speciesId" TEXT,
    "minNormal" REAL,
    "maxNormal" REAL,
    "unit" TEXT,
    "price" REAL NOT NULL,
    "turnaround" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestCatalog_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species" ("_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
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
    CONSTRAINT "Invoice_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabSample" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "barcode" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "clinicId" TEXT,
    "invoiceId" TEXT,
    "referringDoctor" TEXT,
    "referringDoctorAr" TEXT,
    "testIds" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Collected',
    "priority" TEXT NOT NULL DEFAULT 'Normal',
    "notes" TEXT,
    "collectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LabSample_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LabSample_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic" ("_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LabSample_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SampleResult" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "sampleId" TEXT NOT NULL,
    "catalogId" TEXT NOT NULL,
    "resultValue" TEXT NOT NULL,
    "isPanic" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "labComments" TEXT,
    "enteredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enteredBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SampleResult_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "LabSample" ("_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SampleResult_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "TestCatalog" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "fullNameAr" TEXT,
    "role" TEXT NOT NULL DEFAULT 'TECHNICIAN',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "description" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ValidationRule" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "catalogId" TEXT NOT NULL,
    "minValue" REAL,
    "maxValue" REAL,
    "panicLowValue" REAL,
    "panicHighValue" REAL,
    "allowDuplicateWithin" INTEGER,
    "customRules" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ValidationRule_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "TestCatalog" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_taxNumber_key" ON "Clinic"("taxNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_phone_key" ON "Clinic"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "TestCatalog_testCode_key" ON "TestCatalog"("testCode");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LabSample_barcode_key" ON "LabSample"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ValidationRule_catalogId_key" ON "ValidationRule"("catalogId");
