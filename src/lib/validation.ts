import { db } from "@/lib/db";

export interface ValidationError {
  valid: boolean;
  warning?: string;
  error?: string;
  isPanic?: boolean;
}

export async function validateResultValue(
  catalogId: string,
  resultValue: string,
  sampleId: string
): Promise<ValidationError> {
  try {
    const numValue = parseFloat(resultValue);

    if (isNaN(numValue)) {
      return {
        valid: false,
        error: "Result must be a valid number",
      };
    }

    // Get validation rules for this test
    const rules = await db.validationRule.findUnique({
      where: { catalogId },
    });

    if (!rules) {
      return { valid: true };
    }

    let isPanic = false;
    let warning = "";
    let error = "";

    // Check panic values
    if (
      rules.panicLowValue !== null &&
      numValue < rules.panicLowValue
    ) {
      isPanic = true;
      error = `CRITICAL: Value ${numValue} is below panic threshold (${rules.panicLowValue})`;
    } else if (
      rules.panicHighValue !== null &&
      numValue > rules.panicHighValue
    ) {
      isPanic = true;
      error = `CRITICAL: Value ${numValue} is above panic threshold (${rules.panicHighValue})`;
    }

    // Check normal ranges
    if (!error) {
      if (rules.minValue !== null && numValue < rules.minValue) {
        warning = `Warning: Value ${numValue} is below minimum normal (${rules.minValue})`;
      } else if (rules.maxValue !== null && numValue > rules.maxValue) {
        warning = `Warning: Value ${numValue} is above maximum normal (${rules.maxValue})`;
      }
    }

    // Check for duplicates
    if (rules.allowDuplicateWithin !== null && rules.allowDuplicateWithin > 0) {
      const cutoffTime = new Date(
        Date.now() - rules.allowDuplicateWithin * 60 * 60 * 1000
      );

      const recentResult = await db.sampleResult.findFirst({
        where: {
          catalogId,
          sample: {
            petId: (
              await db.labSample.findUnique({
                where: { id: sampleId },
                select: { petId: true },
              })
            )?.petId,
          },
          createdAt: { gte: cutoffTime },
          id: { not: sampleId }, // Exclude current result if updating
        },
      });

      if (recentResult) {
        warning += warning
          ? ` | `
          : ``;
        warning += `Warning: This test was already performed in the last ${rules.allowDuplicateWithin} hours`;
      }
    }

    return {
      valid: !error,
      warning: warning || undefined,
      error: error || undefined,
      isPanic,
    };
  } catch (error) {
    console.error("Validation error:", error);
    return {
      valid: false,
      error: "Validation check failed",
    };
  }
}

export async function checkResultLogic(
  resultValue: string,
  catalogId: string
): Promise<ValidationError> {
  // Additional custom logic can be added here based on test type
  // For example: if test is glucose and result is 1000, that's suspicious

  const catalog = await db.testCatalog.findUnique({
    where: { id: catalogId },
  });

  if (!catalog) {
    return { valid: false, error: "Test not found" };
  }

  // Custom rules for specific tests can go here
  // Example:
  // if (catalog.testCode === "GLU" && parseFloat(resultValue) > 1000) {
  //   return { valid: false, error: "Glucose value suspiciously high" };
  // }

  return { valid: true };
}
