/**
 * /api/workflow
 *
 * Four atomic actions that cover the full lab lifecycle:
 *
 *  POST  { action: "intake"   }  → create sample + draft invoice in one transaction
 *  POST  { action: "results"  }  → enter/update all results for a sample, auto-set status
 *  POST  { action: "approve"  }  → doctor approves all results → mark sample Approved
 *  POST  { action: "finalize" }  → mark invoice Paid/Partially_Paid, attach ZATCA QR
 *
 * Every action is authenticated, validated, and fully audited.
 */

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";
import { validateResultValue } from "@/lib/validation";
import { serializeTestIds, deserializeTestIds } from "@/lib/utils";
import { z } from "zod";

// ─── Zod schemas ────────────────────────────────────────────────────────────

const intakeSchema = z.object({
  action: z.literal("intake"),
  // Sample fields
  petId: z.string().min(1, "Pet is required"),
  clinicId: z.string().optional(),
  referringDoctor: z.string().optional(),
  referringDoctorAr: z.string().optional(),
  testIds: z.array(z.string().min(1)).min(1, "At least one test is required"),
  priority: z.enum(["Normal", "Urgent", "STAT"]).default("Normal"),
  notes: z.string().optional(),
  collectedAt: z.string().optional(), // ISO date; defaults to now
});

const resultsSchema = z.object({
  action: z.literal("results"),
  sampleId: z.string().min(1),
  results: z
    .array(
      z.object({
        catalogId: z.string().min(1),
        resultValue: z.string().min(1),
        labComments: z.string().optional(),
      })
    )
    .min(1, "At least one result is required"),
});

const approveSchema = z.object({
  action: z.literal("approve"),
  sampleId: z.string().min(1),
  notes: z.string().optional(), // optional doctor note on approval
});

const finalizeSchema = z.object({
  action: z.literal("finalize"),
  invoiceId: z.string().min(1),
  paidAmount: z.number().min(0),
  zatcaQr: z.string().optional(),
  notes: z.string().optional(),
});

const workflowSchema = z.discriminatedUnion("action", [
  intakeSchema,
  resultsSchema,
  approveSchema,
  finalizeSchema,
]);

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Generate next barcode: SMP-2025-0042 */
async function nextBarcode(): Promise<string> {
  const last = await db.labSample.findFirst({
    orderBy: { createdAt: "desc" },
    select: { barcode: true },
  });
  const n = last ? parseInt(last.barcode.replace(/\D/g, ""), 10) + 1 : 1;
  return `SMP-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`;
}

/** Generate next invoice number: INV-00042 */
async function nextInvoiceNumber(): Promise<string> {
  const last = await db.invoice.findFirst({
    orderBy: { createdAt: "desc" },
    select: { invoiceNumber: true },
  });
  const n = last
    ? parseInt(last.invoiceNumber.replace(/\D/g, ""), 10) + 1
    : 1;
  return `INV-${String(n).padStart(5, "0")}`;
}

// ─── Handler ────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = workflowSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // ── STAGE 1: INTAKE ────────────────────────────────────────────────────────
  if (data.action === "intake") {
    try {
      // Verify pet exists
      const pet = await db.pet.findUnique({
        where: { id: data.petId },
        include: { clinic: true },
      });
      if (!pet) {
        return NextResponse.json({ error: "Pet not found" }, { status: 404 });
      }

      // Verify all testIds exist and are active, collect prices
      const tests = await db.testCatalog.findMany({
        where: { id: { in: data.testIds }, active: true },
      });
      if (tests.length !== data.testIds.length) {
        const foundIds = tests.map((t) => t.id);
        const missing = data.testIds.filter((id) => !foundIds.includes(id));
        return NextResponse.json(
          { error: "Some tests not found or inactive", missing },
          { status: 400 }
        );
      }

      const clinicId = data.clinicId ?? pet.clinicId ?? undefined;

      // Calculate invoice amounts
      const subTotal = tests.reduce((sum, t) => sum + t.price, 0);
      const vatRate = 0.15;
      const vatAmount = parseFloat((subTotal * vatRate).toFixed(2));
      const totalAmount = parseFloat((subTotal + vatAmount).toFixed(2));

      // Run as a transaction — both records created or neither
      const [sample, invoice] = await db.$transaction(async (tx) => {
        const barcode = await nextBarcode();
        const invoiceNumber = await nextInvoiceNumber();

        const inv = await tx.invoice.create({
          data: {
            invoiceNumber,
            clinicId: clinicId!,
            subTotal,
            vatRate,
            vatAmount,
            totalAmount,
            paidAmount: 0,
            status: "Unpaid",
          },
        });

        const smp = await tx.labSample.create({
          data: {
            barcode,
            petId: data.petId,
            clinicId,
            invoiceId: inv.id,
            referringDoctor: data.referringDoctor,
            referringDoctorAr: data.referringDoctorAr,
            testIds: serializeTestIds(data.testIds),
            priority: data.priority,
            status: "Collected",
            notes: data.notes,
            collectedAt: data.collectedAt
              ? new Date(data.collectedAt)
              : new Date(),
          },
          include: {
            pet: { include: { species: true } },
            clinic: true,
          },
        });

        return [smp, inv];
      });

      await logAudit({
        userId: auth.userId,
        action: "create",
        tableName: "LabSample",
        recordId: sample.id,
        description: `Intake: sample ${sample.barcode} + invoice ${invoice.invoiceNumber}`,
        newValue: { barcode: sample.barcode, testIds: data.testIds, invoiceId: invoice.id },
      });

      return NextResponse.json(
        {
          stage: "intake",
          sample: { ...sample, testIds: deserializeTestIds(sample.testIds) },
          invoice,
          summary: {
            barcode: sample.barcode,
            invoiceNumber: invoice.invoiceNumber,
            testsOrdered: tests.length,
            totalAmount,
          },
        },
        { status: 201 }
      );
    } catch (err) {
      console.error("[workflow/intake]", err);
      return NextResponse.json(
        { error: "Intake failed — transaction rolled back" },
        { status: 500 }
      );
    }
  }

  // ── STAGE 2: ENTER RESULTS ─────────────────────────────────────────────────
  if (data.action === "results") {
    // Technicians and above can enter results
    if (auth.role !== "TECHNICIAN" && auth.role !== "DOCTOR" && auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      const sample = await db.labSample.findUnique({
        where: { id: data.sampleId },
        include: { results: true },
      });
      if (!sample) {
        return NextResponse.json({ error: "Sample not found" }, { status: 404 });
      }
      if (sample.status === "Approved") {
        return NextResponse.json(
          { error: "Sample is already approved — results cannot be changed" },
          { status: 409 }
        );
      }

      // Validate every result value before touching the DB
      const validationErrors: { catalogId: string; error: string }[] = [];
      for (const r of data.results) {
        const v = await validateResultValue(r.catalogId, r.resultValue, data.sampleId);
        if (!v.valid && v.error) {
          validationErrors.push({ catalogId: r.catalogId, error: v.error });
        }
      }
      // Panic values warn but do NOT block — they are flagged on the record
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { error: "Result validation failed", details: validationErrors },
          { status: 400 }
        );
      }

      // Upsert each result (idempotent re-entry)
      const upserted = await db.$transaction(
        data.results.map((r) => {
          const val = parseFloat(r.resultValue);
          return db.sampleResult.upsert({
            where: {
              // use a compound unique index if you add one, otherwise fall back to create
              id:
                sample.results.find((ex) => ex.catalogId === r.catalogId)
                  ?.id ?? "__new__",
            },
            create: {
              sampleId: data.sampleId,
              catalogId: r.catalogId,
              resultValue: r.resultValue,
              labComments: r.labComments,
              isPanic: isNaN(val) ? false : false, // panic set below
              enteredBy: auth.userId,
            },
            update: {
              resultValue: r.resultValue,
              labComments: r.labComments,
              enteredBy: auth.userId,
              approvedBy: null,
              approvedAt: null,
            },
          });
        })
      );

      // Re-check panic flags after upsert (needs catalog thresholds)
      const catalogIds = data.results.map((r) => r.catalogId);
      const catalogs = await db.testCatalog.findMany({
        where: { id: { in: catalogIds } },
        include: { validationRule: true },
      });
      const panicUpdates: string[] = [];

      await db.$transaction(
        upserted.map((res) => {
          const cat = catalogs.find((c) => c.id === res.catalogId);
          const val = parseFloat(res.resultValue);
          const rule = cat?.validationRule;
          const isPanic =
            !isNaN(val) &&
            !!rule &&
            ((rule.panicLowValue !== null && val < rule.panicLowValue) ||
              (rule.panicHighValue !== null && val > rule.panicHighValue));
          if (isPanic) panicUpdates.push(res.id);
          return db.sampleResult.update({
            where: { id: res.id },
            data: { isPanic },
          });
        })
      );

      // Advance sample status: Collected → In_Progress
      const newStatus =
        sample.status === "Collected" ? "In_Progress" : sample.status;
      await db.labSample.update({
        where: { id: data.sampleId },
        data: { status: newStatus },
      });

      await logAudit({
        userId: auth.userId,
        action: "update",
        tableName: "LabSample",
        recordId: data.sampleId,
        description: `Results entered for sample ${sample.barcode} (${upserted.length} tests)`,
        newValue: { resultsCount: upserted.length, panicCount: panicUpdates.length },
      });

      return NextResponse.json({
        stage: "results",
        sampleId: data.sampleId,
        status: newStatus,
        resultsEntered: upserted.length,
        panicFlagged: panicUpdates.length,
        warning:
          panicUpdates.length > 0
            ? `${panicUpdates.length} result(s) flagged as PANIC — review before approval`
            : undefined,
      });
    } catch (err) {
      console.error("[workflow/results]", err);
      return NextResponse.json({ error: "Failed to enter results" }, { status: 500 });
    }
  }

  // ── STAGE 3: APPROVE ───────────────────────────────────────────────────────
  if (data.action === "approve") {
    if (auth.role !== "DOCTOR" && auth.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only DOCTOR or ADMIN can approve results" },
        { status: 403 }
      );
    }

    try {
      const sample = await db.labSample.findUnique({
        where: { id: data.sampleId },
        include: { results: true },
      });
      if (!sample) {
        return NextResponse.json({ error: "Sample not found" }, { status: 404 });
      }
      if (sample.status === "Approved") {
        return NextResponse.json(
          { error: "Sample already approved" },
          { status: 409 }
        );
      }
      if (sample.results.length === 0) {
        return NextResponse.json(
          { error: "No results entered — cannot approve an empty sample" },
          { status: 400 }
        );
      }

      const pendingTests = deserializeTestIds(sample.testIds).length;
      const enteredTests = sample.results.length;
      if (enteredTests < pendingTests) {
        return NextResponse.json(
          {
            error: "Not all tests have results",
            pending: pendingTests - enteredTests,
            hint: "Enter all results before approving",
          },
          { status: 400 }
        );
      }

      const now = new Date();

      await db.$transaction([
        // Stamp approval on every result
        db.sampleResult.updateMany({
          where: { sampleId: data.sampleId, approvedAt: null },
          data: { approvedBy: auth.userId, approvedAt: now },
        }),
        // Advance sample to Approved + set completedAt
        db.labSample.update({
          where: { id: data.sampleId },
          data: { status: "Approved", completedAt: now },
        }),
      ]);

      await logAudit({
        userId: auth.userId,
        action: "approve",
        tableName: "LabSample",
        recordId: data.sampleId,
        description: `Doctor approved sample ${sample.barcode}`,
        newValue: { approvedBy: auth.userId, notes: data.notes },
      });

      return NextResponse.json({
        stage: "approve",
        sampleId: data.sampleId,
        status: "Approved",
        approvedBy: auth.userId,
        approvedAt: now,
        resultsApproved: sample.results.length,
      });
    } catch (err) {
      console.error("[workflow/approve]", err);
      return NextResponse.json({ error: "Approval failed" }, { status: 500 });
    }
  }

  // ── STAGE 4: FINALIZE INVOICE ──────────────────────────────────────────────
  if (data.action === "finalize") {
    if (auth.role !== "ADMIN" && auth.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Only ADMIN or DOCTOR can finalize invoices" },
        { status: 403 }
      );
    }

    try {
      const invoice = await db.invoice.findUnique({
        where: { id: data.invoiceId },
        include: {
          samples: { select: { id: true, status: true, barcode: true } },
        },
      });
      if (!invoice) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

      // Guard: all linked samples must be Approved before payment
      const unapproved = invoice.samples.filter((s) => s.status !== "Approved");
      if (unapproved.length > 0) {
        return NextResponse.json(
          {
            error: "Cannot finalize — some samples are not yet approved",
            unapproved: unapproved.map((s) => s.barcode),
          },
          { status: 400 }
        );
      }

      if (invoice.status === "Paid") {
        return NextResponse.json(
          { error: "Invoice is already fully paid" },
          { status: 409 }
        );
      }

      const paidAmount = Math.min(data.paidAmount, invoice.totalAmount);
      const status =
        paidAmount >= invoice.totalAmount
          ? "Paid"
          : paidAmount > 0
          ? "Partially_Paid"
          : "Unpaid";

      const updated = await db.invoice.update({
        where: { id: data.invoiceId },
        data: {
          paidAmount,
          status,
          zatcaQr: data.zatcaQr,
          notes: data.notes,
        },
      });

      await logAudit({
        userId: auth.userId,
        action: "update",
        tableName: "Invoice",
        recordId: data.invoiceId,
        description: `Invoice ${invoice.invoiceNumber} finalized — ${status}`,
        oldValue: { status: invoice.status, paidAmount: invoice.paidAmount },
        newValue: { status, paidAmount },
      });

      return NextResponse.json({
        stage: "finalize",
        invoiceId: data.invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        status,
        paidAmount,
        outstanding: parseFloat((invoice.totalAmount - paidAmount).toFixed(2)),
      });
    } catch (err) {
      console.error("[workflow/finalize]", err);
      return NextResponse.json(
        { error: "Invoice finalization failed" },
        { status: 500 }
      );
    }
  }
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(request.url);
  const sampleId = searchParams.get("sampleId");
  const invoiceId = searchParams.get("invoiceId");

  if (!sampleId && !invoiceId) {
    return NextResponse.json(
      { error: "Provide sampleId or invoiceId" },
      { status: 400 }
    );
  }

  try {
    if (sampleId) {
      const sample = await db.labSample.findUnique({
        where: { id: sampleId },
        include: {
          pet: { include: { species: true } },
          clinic: true,
          invoice: true,
          results: {
            include: { catalog: true },
            orderBy: { enteredAt: "asc" },
          },
        },
      });
      if (!sample) {
        return NextResponse.json({ error: "Sample not found" }, { status: 404 });
      }

      const totalTests = deserializeTestIds(sample.testIds).length;
      const enteredResults = sample.results.length;
      const approvedResults = sample.results.filter((r) => r.approvedAt).length;
      const panicResults = sample.results.filter((r) => r.isPanic).length;

      return NextResponse.json({
        sample: { ...sample, testIds: deserializeTestIds(sample.testIds) },
        progress: {
          stage: sample.status,
          totalTests,
          enteredResults,
          approvedResults,
          panicResults,
          pendingResults: totalTests - enteredResults,
          readyToApprove: enteredResults === totalTests && approvedResults < totalTests,
        },
      });
    }

    if (invoiceId) {
      const invoice = await db.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          clinic: true,
          samples: {
            include: {
              pet: { include: { species: true } },
              results: { include: { catalog: true } },
            },
          },
        },
      });
      if (!invoice) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

      const allApproved = invoice.samples.every((s) => s.status === "Approved");

      return NextResponse.json({
        invoice: {
          ...invoice,
          samples: invoice.samples.map((s) => ({ ...s, testIds: deserializeTestIds(s.testIds) })),
        },
        progress: {
          samplesTotal: invoice.samples.length,
          samplesApproved: invoice.samples.filter((s) => s.status === "Approved").length,
          readyToFinalize: allApproved && invoice.status !== "Paid",
        },
      });
    }
  } catch (err) {
    console.error("[workflow/get]", err);
    return NextResponse.json({ error: "Failed to fetch workflow status" }, { status: 500 });
  }
}