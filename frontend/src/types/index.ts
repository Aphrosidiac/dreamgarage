export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'STAFF'
  branchId: string
}

export interface Branch {
  id: string
  name: string
  code: string
  address?: string
  phone?: string
  email?: string
}

export interface StockCategory {
  id: string
  name: string
  code?: string
  branchId: string
  _count?: { items: number }
}

export interface StockItem {
  id: string
  itemCode: string
  description: string
  uom: string
  costPrice: number
  sellPrice: number
  quantity: number
  categoryId?: string
  category?: StockCategory
  branchId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ─── DOCUMENTS ─────────────────────────────────────────────
export type DocumentType = 'QUOTATION' | 'INVOICE' | 'RECEIPT' | 'DELIVERY_ORDER'

export type DocumentStatus =
  | 'DRAFT' | 'PENDING' | 'APPROVED' | 'SENT'
  | 'OUTSTANDING' | 'PARTIAL' | 'PAID' | 'OVERDUE'
  | 'COMPLETED' | 'CANCELLED' | 'VOID'

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CREDIT_CARD' | 'EWALLET' | 'TNG' | 'BOOST'

export interface DocumentItem {
  id: string
  documentId: string
  stockItemId?: string
  itemCode?: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  discountPercent: number
  taxRate: number
  subtotal: number
  taxAmount: number
  total: number
  sortOrder: number
}

export interface Payment {
  id: string
  documentId: string
  amount: number
  paymentMethod: PaymentMethod
  referenceNumber?: string
  notes?: string
  bankName?: string
  createdBy?: { name: string }
  createdAt: string
}

export interface Document {
  id: string
  branchId: string
  documentType: DocumentType
  documentNumber: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  vehiclePlate?: string
  vehicleModel?: string
  vehicleMileage?: string
  issueDate: string
  dueDate?: string
  status: DocumentStatus
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  paidAmount: number
  notes?: string
  terms?: string
  footerNote?: string
  createdBy?: User
  items?: DocumentItem[]
  payments?: Payment[]
  convertedFromId?: string
  convertedFromType?: DocumentType
  conversionTargets?: DocumentType[]
  _count?: { items: number; payments: number }
  createdAt: string
  updatedAt: string
}

export interface DocumentSetting {
  id: string
  branchId: string
  documentType: DocumentType
  prefix: string
  nextNumber: number
  paddingLength: number
  includeYear: boolean
  yearFormat: string
  separator: string
  template: string
  templateColor: string
  documentLabel?: string
  footerNotes?: string
  documentSize: string
  logoScale: number
  defaultNotes?: string
  defaultTerms?: string
  defaultPaymentTermDays: number
}

export interface PaymentTerm {
  id: string
  branchId: string
  name: string
  days: number
  description?: string
  isDefault: boolean
  isActive: boolean
}

export interface DocumentFormData {
  documentType: DocumentType
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  vehiclePlate?: string
  vehicleModel?: string
  vehicleMileage?: string
  issueDate?: string
  dueDate?: string
  notes?: string
  terms?: string
  footerNote?: string
  discountAmount?: number
  items: {
    stockItemId?: string
    itemCode?: string
    description: string
    quantity: number
    unit?: string
    unitPrice: number
    discountPercent?: number
    taxRate?: number
    sortOrder?: number
  }[]
}

// ─── DASHBOARD ─────────────────────────────────────────────
export interface DashboardStats {
  totalItems: number
  totalStockQty: number
  invoicesToday: number
  invoicesThisMonth: number
  quotationsThisMonth: number
  revenueToday: number
  revenueThisMonth: number
}

// ─── GENERIC ───────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}
