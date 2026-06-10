// Type definitions for the enhanced vet lab system

export interface LabUser {
  id: string
  email: string
  fullName: string
  fullNameAr: string
  role: 'DOCTOR' | 'TECHNICIAN' | 'ADMIN'
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AuditLogEntry {
  id: string
  userId: string
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject'
  tableName: string
  recordId: string
  oldValue?: Record<string, any>
  newValue?: Record<string, any>
  description?: string
  createdAt: Date
  user?: {
    fullName: string
    fullNameAr: string
    email: string
  }
}

export interface ValidationResult {
  valid: boolean
  warning?: string
  error?: string
  isPanic?: boolean
}

export interface ValidationRule {
  id: string
  catalogId: string
  minValue?: number
  maxValue?: number
  panicLowValue?: number
  panicHighValue?: number
  allowDuplicateWithin?: number // hours
  customRules?: string // JSON
}

export interface EnhancedSampleResult {
  id: string
  sampleId: string
  catalogId: string
  resultValue: string
  isPanic: boolean
  labComments?: string
  approvedBy?: string
  approvedAt?: Date
  enteredBy?: string
  enteredAt: Date
  createdAt: Date
  updatedAt: Date
  catalog?: {
    id: string
    testNameEn: string
    testNameAr: string
    unit?: string
    minNormal?: number
    maxNormal?: number
  }
}

export interface DashboardStats {
  today: number
  inProgress: number
  pendingApproval: number
  avgTat: string
}

export interface PendingApproval {
  id: string
  barcode: string
  pet: {
    name: string
    species: {
      nameAr: string
      nameEn: string
    }
  }
  priority: string
  results: Array<{
    id: string
    resultValue: string
    isPanic: boolean
  }>
  collectedAt: Date
}

export interface CreateUserRequest {
  email: string
  password: string
  fullName: string
  fullNameAr?: string
  role: 'DOCTOR' | 'TECHNICIAN' | 'ADMIN'
}

export interface UpdateResultRequest {
  id: string
  resultValue?: string
  labComments?: string
  approvedBy?: string
  approvedAt?: Date
}

export interface ValidationError {
  valid: boolean
  warning?: string
  error?: string
  isPanic?: boolean
}

export interface SessionUser {
  id: string
  email: string
  name: string
  role: 'DOCTOR' | 'TECHNICIAN' | 'ADMIN'
}

declare module 'next-auth' {
  interface Session {
    user: SessionUser
  }

  interface User {
    id: string
    email: string
    name: string
    role: 'DOCTOR' | 'TECHNICIAN' | 'ADMIN'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'DOCTOR' | 'TECHNICIAN' | 'ADMIN'
  }
}
