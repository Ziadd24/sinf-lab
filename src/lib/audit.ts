import { db } from "@/lib/db";

export interface AuditLogData {
  userId: string;
  action: "create" | "update" | "delete" | "approve" | "reject";
  tableName: string;
  recordId: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  description?: string;
  ipAddress?: string;
}

export async function logAudit(data: AuditLogData): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        tableName: data.tableName,
        recordId: data.recordId,
        oldValue: data.oldValue ? JSON.stringify(data.oldValue) : null,
        newValue: data.newValue ? JSON.stringify(data.newValue) : null,
        description: data.description,
        ipAddress: data.ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to log audit:", error);
    // Don't throw - audit logging failure shouldn't break the operation
  }
}

export async function getAuditHistory(
  tableName: string,
  recordId: string,
  limit: number = 50
) {
  return db.auditLog.findMany({
    where: {
      tableName,
      recordId,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          fullNameAr: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
