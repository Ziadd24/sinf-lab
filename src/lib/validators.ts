import { z } from "zod";

// ─── Bundle ───────────────────────────────────────────────────────────────
export const bundleCreateSchema = z.object({
  nameEn: z.string().optional().default(""),
  nameAr: z.string().min(1, "Arabic name is required"),
  testCodes: z.string().min(1, "At least one test code is required"),
  animalIds: z.string().optional(),
  customPrice: z.coerce.number().min(0).nullable().optional(),
  active: z.boolean().default(true),
});

export const bundleUpdateSchema = z.object({
  id: z.string().min(1),
  nameEn: z.string().optional(),
  nameAr: z.string().min(1).optional(),
  testCodes: z.string().min(1).optional(),
  animalIds: z.string().optional(),
  customPrice: z.coerce.number().min(0).nullable().optional(),
  active: z.boolean().optional(),
});

// ─── Species ──────────────────────────────────────────────────────────────
export const speciesCreateSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().min(1, "Arabic name is required"),
  icon: z.string().optional(),
});

export const speciesUpdateSchema = z.object({
  id: z.string().min(1),
  nameEn: z.string().min(1).optional(),
  nameAr: z.string().min(1).optional(),
  icon: z.string().optional(),
});

// ─── Animal ───────────────────────────────────────────────────────────────
export const animalCreateSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().min(1, "Arabic name is required"),
  icon: z.string().nullable().optional(),
  active: z.boolean().default(true),
});

export const animalUpdateSchema = z.object({
  id: z.string().min(1),
  nameEn: z.string().min(1).optional(),
  nameAr: z.string().min(1).optional(),
  icon: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

// ─── Clinic ───────────────────────────────────────────────────────────────
export const clinicCreateSchema = z.object({
  clinicName: z.string().min(1, "Clinic name is required"),
  clinicNameAr: z.string().optional(),
  taxNumber: z.string().optional(),
  commercialRegister: z.string().optional(),
  contactName: z.string().optional(),
  contactNameAr: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  addressAr: z.string().optional(),
  city: z.string().optional(),
  cityAr: z.string().optional(),
});

export const clinicUpdateSchema = z.object({
  id: z.string().min(1),
  clinicName: z.string().min(1).optional(),
  clinicNameAr: z.string().optional(),
  taxNumber: z.string().optional(),
  commercialRegister: z.string().optional(),
  contactName: z.string().optional(),
  contactNameAr: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  addressAr: z.string().optional(),
  city: z.string().optional(),
  cityAr: z.string().optional(),
  active: z.boolean().optional(),
});

// ─── Pet ──────────────────────────────────────────────────────────────────
export const petCreateSchema = z.object({
  name: z.string().min(1, "Pet name is required"),
  nameAr: z.string().optional(),
  speciesId: z.string().min(1, "Species is required"),
  breed: z.string().optional(),
  breedAr: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(["Male", "Female", "Unknown"]).default("Unknown"),
  chipNumber: z.string().optional(),
  ownerId: z.string().optional(),
  ownerName: z.string().optional(),
  ownerNameAr: z.string().optional(),
  ownerPhone: z.string().optional(),
  clinicId: z.string().optional(),
});

export const petUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  nameAr: z.string().optional(),
  speciesId: z.string().min(1).optional(),
  breed: z.string().optional(),
  breedAr: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(["Male", "Female", "Unknown"]).optional(),
  chipNumber: z.string().optional(),
  ownerId: z.string().optional(),
  ownerName: z.string().optional(),
  ownerNameAr: z.string().optional(),
  ownerPhone: z.string().optional(),
  clinicId: z.string().optional(),
});

// ─── TestCatalog ──────────────────────────────────────────────────────────
export const testCreateSchema = z.object({
  testCode: z.string().min(1, "Test code is required"),
  testNameEn: z.string().min(1, "English name is required"),
  testNameAr: z.string().min(1, "Arabic name is required"),
  category: z.string().optional(),
  categoryAr: z.string().optional(),
  speciesId: z.string().optional(),
  minNormal: z.number().nullable().optional(),
  maxNormal: z.number().nullable().optional(),
  minNormalOld: z.number().nullable().optional(),
  maxNormalOld: z.number().nullable().optional(),
  unit: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  turnaround: z.string().optional(),
  active: z.boolean().default(true),
  animalIds: z.string().nullable().optional(),
});

export const testUpdateSchema = z.object({
  id: z.string().min(1),
  testCode: z.string().min(1).optional(),
  testNameEn: z.string().min(1).optional(),
  testNameAr: z.string().min(1).optional(),
  category: z.string().optional(),
  categoryAr: z.string().optional(),
  speciesId: z.string().optional(),
  minNormal: z.number().nullable().optional(),
  maxNormal: z.number().nullable().optional(),
  minNormalOld: z.number().nullable().optional(),
  maxNormalOld: z.number().nullable().optional(),
  unit: z.string().optional(),
  price: z.number().min(0).optional(),
  turnaround: z.string().optional(),
  active: z.boolean().optional(),
  animalIds: z.string().nullable().optional(),
});

// ─── Invoice ──────────────────────────────────────────────────────────────
export const invoiceCreateSchema = z.object({
  clinicId: z.string().optional(),
  subTotal: z.number().min(0, "Subtotal must be non-negative"),
  vatRate: z.number().default(0.15),
  vatAmount: z.number().min(0),
  totalAmount: z.number().min(0),
  paidAmount: z.number().min(0).default(0),
  status: z.enum(["Paid", "Partially_Paid", "Unpaid"]).default("Unpaid"),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  zatcaQr: z.string().optional(),
});

export const invoiceUpdateSchema = z.object({
  id: z.string().min(1),
  subTotal: z.number().min(0).optional(),
  vatRate: z.number().optional(),
  vatAmount: z.number().min(0).optional(),
  totalAmount: z.number().min(0).optional(),
  paidAmount: z.number().min(0).optional(),
  status: z.enum(["Paid", "Partially_Paid", "Unpaid"]).optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  zatcaQr: z.string().optional(),
});

// ─── LabSample ────────────────────────────────────────────────────────────
export const sampleCreateSchema = z.object({
  barcode: z.string().min(1, "Barcode is required"),
  petId: z.string().min(1, "Pet is required"),
  clinicId: z.string().optional(),
  invoiceId: z.string().optional(),
  referringDoctor: z.string().optional(),
  referringDoctorAr: z.string().optional(),
  testIds: z.array(z.string().min(1)).min(1, "At least one test is required"),
  status: z.enum(["Collected", "In_Progress", "Completed", "Approved"]).default("Collected"),
  priority: z.enum(["Normal", "Urgent", "STAT"]).default("Normal"),
  notes: z.string().optional(),
});

export const sampleUpdateSchema = z.object({
  id: z.string().min(1),
  clinicId: z.string().optional(),
  invoiceId: z.string().optional(),
  referringDoctor: z.string().optional(),
  referringDoctorAr: z.string().optional(),
  testIds: z.array(z.string().min(1)).optional(),
  status: z.enum(["Collected", "In_Progress", "Completed", "Approved"]).optional(),
  priority: z.enum(["Normal", "Urgent", "STAT"]).optional(),
  notes: z.string().optional(),
  completedAt: z.string().optional(),
});

// ─── SampleResult ─────────────────────────────────────────────────────────
export const resultCreateSchema = z.object({
  sampleId: z.string().min(1, "Sample is required"),
  catalogId: z.string().min(1, "Test catalog entry is required"),
  resultValue: z.string().min(1, "Result value is required"),
  labComments: z.string().optional(),
});

export const resultUpdateSchema = z.object({
  id: z.string().min(1),
  resultValue: z.string().optional(),
  labComments: z.string().optional(),
});

// ─── User ─────────────────────────────────────────────────────────────────
export const userCreateSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
  fullNameAr: z.string().optional(),
  role: z.enum(["DOCTOR", "TECHNICIAN", "ADMIN"]),
});

// ─── Pagination ───────────────────────────────────────────────────────────
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  search: z.string().optional(),
});