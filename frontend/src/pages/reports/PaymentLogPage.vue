<template>
  <div>
    <!-- Main Tabs + Actions -->
    <div class="flex items-center mb-4 border-b border-dark-800">
      <div class="flex items-center gap-1">
        <button
          @click="activeTab = 'received'"
          :class="['px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors', activeTab === 'received' ? 'text-gold-500 border-gold-500' : 'text-dark-400 border-transparent hover:text-dark-200']"
        >Received</button>
        <button
          @click="activeTab = 'payable'; if (!apLoaded) fetchAP()"
          :class="['px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors', activeTab === 'payable' ? 'text-gold-500 border-gold-500' : 'text-dark-400 border-transparent hover:text-dark-200']"
        >Payable</button>
      </div>
      <div class="ml-auto flex gap-2 -mb-px pb-1.5">
        <template v-if="activeTab === 'received'">
          <BaseButton variant="secondary" size="sm" @click="exportExcel">
            <FileSpreadsheet class="w-4 h-4 mr-1.5" /> Excel
          </BaseButton>
          <BaseButton variant="secondary" size="sm" @click="exportPdf">
            <FileText class="w-4 h-4 mr-1.5" /> PDF
          </BaseButton>
          <BaseButton variant="secondary" size="sm" @click="printLog">
            <Printer class="w-4 h-4 mr-1.5" /> Print
          </BaseButton>
        </template>
        <template v-if="activeTab === 'payable'">
          <BaseButton variant="primary" size="sm" @click="showCreateModal = true">
            <Plus class="w-4 h-4 mr-1" /> Record Payment
          </BaseButton>
        </template>
      </div>
    </div>

    <!-- ═══ Received Tab (Payment Log) ═══ -->
    <template v-if="activeTab === 'received'">
      <!-- Method Filters -->
      <div class="flex items-center gap-2 mb-4 flex-wrap">
        <button
          v-for="mt in methodTabs"
          :key="mt.value"
          @click="switchMethod(mt.value)"
          :class="[
            'px-3 py-1.5 text-xs font-medium rounded-full transition-colors',
            activeMethod === mt.value
              ? 'bg-gold-500/15 text-gold-500 ring-1 ring-gold-500/30'
              : 'bg-dark-800 text-dark-400 hover:text-dark-200 hover:bg-dark-700',
          ]"
        >
          {{ mt.label }}
        </button>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-3 mb-4 flex-wrap">
        <div class="relative flex-1 min-w-[200px] max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            v-model="search"
            @input="debouncedFetch"
            type="text"
            placeholder="Search by invoice, customer, plate..."
            class="w-full bg-dark-800 border border-dark-700 rounded-lg pl-10 pr-3 py-2 text-dark-100 text-sm placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
          />
        </div>
        <input v-model="dateFrom" type="date" @change="fetchData" class="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
        <span class="text-dark-500 text-sm">to</span>
        <input v-model="dateTo" type="date" @change="fetchData" class="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
      </div>

      <!-- Summary Cards -->
      <div v-if="summary" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 print:hidden">
        <div class="bg-dark-900 border border-dark-800 rounded-xl p-4">
          <p class="text-dark-400 text-xs uppercase tracking-wider mb-1">Total Collections</p>
          <p class="text-dark-100 text-xl font-bold">RM {{ summary.grandTotal.toFixed(2) }}</p>
        </div>
        <div class="bg-dark-900 border border-dark-800 rounded-xl p-4">
          <p class="text-dark-400 text-xs uppercase tracking-wider mb-1">Transactions</p>
          <p class="text-dark-100 text-xl font-bold">{{ summary.totalPayments }}</p>
        </div>
        <div v-for="(info, method) in summary.byMethod" :key="method" class="bg-dark-900 border border-dark-800 rounded-xl p-4">
          <p class="text-dark-400 text-xs uppercase tracking-wider mb-1">{{ fmtMethod(method as string) }}</p>
          <p class="text-dark-100 text-lg font-bold">RM {{ info.total.toFixed(2) }}</p>
          <p class="text-dark-500 text-xs">{{ info.count }} txn{{ info.count > 1 ? 's' : '' }}</p>
        </div>
      </div>

      <!-- Table -->
      <BaseTable :columns="columns" :data="payments" :loading="loading" empty-text="No payments found." class="print:hidden">
        <template #cell-createdAt="{ value }">
          {{ fmtDateTime(value) }}
        </template>
        <template #cell-documentNumber="{ value }">
          <span class="text-gold-500">{{ value }}</span>
        </template>
        <template #cell-customerName="{ row }">
          <div>
            <span class="text-dark-200">{{ row.customerName || '—' }}</span>
            <span v-if="row.vehiclePlate" class="text-dark-500 text-xs ml-2">({{ row.vehiclePlate }})</span>
          </div>
        </template>
        <template #cell-paymentMethod="{ value }">
          <BaseBadge :color="methodColor(value)">{{ fmtMethod(value) }}</BaseBadge>
        </template>
        <template #cell-amount="{ value }">
          <span class="text-green-400 font-medium">RM {{ Number(value).toFixed(2) }}</span>
        </template>
        <template #cell-createdBy="{ value }">
          {{ value || '—' }}
        </template>
      </BaseTable>

      <BasePagination
        :page="page"
        :total="total"
        :limit="limit"
        @update:page="(p) => { page = p; fetchData() }"
        class="print:hidden"
      />

      <!-- Print Template -->
      <div id="payment-log-print" class="hidden print:block text-gray-900" style="width: 800px;">
        <div class="bg-gray-900 text-white px-8 py-5 flex items-center gap-4">
          <img src="/logo-doc.png" alt="Dream Garage" class="h-14" />
          <div class="flex-1">
            <h1 class="text-lg font-bold text-yellow-400">DREAM GARAGE (M) SDN BHD</h1>
            <p class="text-gray-300 text-xs mt-1">22, Jalan Mutiara Emas 5/1, Taman Mount Austin, 81100 Johor Bahru, Johor</p>
            <p class="text-gray-300 text-xs">Tel: +60 18-207 8080</p>
          </div>
        </div>
        <div class="bg-white px-8 py-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-900 uppercase">Payment Log</h2>
            <div class="text-right text-sm">
              <p><span class="text-gray-500">Period:</span> <strong>{{ fmtDate(dateFrom) }} — {{ fmtDate(dateTo) }}</strong></p>
              <p v-if="activeMethod"><span class="text-gray-500">Method:</span> <strong>{{ fmtMethod(activeMethod) }}</strong></p>
              <p><span class="text-gray-500">Printed:</span> {{ fmtDate(new Date().toISOString().split('T')[0]) }}</p>
            </div>
          </div>
        </div>
        <div v-if="summary" class="bg-white px-8 py-3 border-b border-gray-200">
          <div class="flex gap-8 text-sm">
            <div><span class="text-gray-500">Total Transactions:</span> <strong>{{ summary.totalPayments }}</strong></div>
            <div v-for="(info, method) in summary.byMethod" :key="method">
              <span class="text-gray-500">{{ fmtMethod(method as string) }}:</span> <strong>RM {{ info.total.toFixed(2) }} ({{ info.count }})</strong>
            </div>
          </div>
        </div>
        <div class="bg-white px-8 py-4">
          <table class="w-full text-xs border-collapse">
            <thead><tr class="border-b-2 border-gray-900">
              <th class="text-left py-2 font-semibold" style="width: 28px;">No</th>
              <th class="text-left py-2 font-semibold" style="width: 65px;">Date/Time</th>
              <th class="text-left py-2 font-semibold" style="width: 80px;">Invoice</th>
              <th class="text-left py-2 font-semibold">Customer</th>
              <th class="text-left py-2 font-semibold" style="width: 65px;">Method</th>
              <th class="text-left py-2 font-semibold" style="width: 55px;">Ref</th>
              <th class="text-right py-2 font-semibold" style="width: 75px;">Amount RM</th>
            </tr></thead>
            <tbody>
              <tr v-for="(p, idx) in allPaymentsForPrint" :key="p.id" class="border-b border-gray-100 align-top">
                <td class="py-1.5">{{ idx + 1 }}</td>
                <td class="py-1.5">{{ fmtDateTime(p.createdAt) }}</td>
                <td class="py-1.5">{{ p.documentNumber }}</td>
                <td class="py-1.5">{{ p.customerName || '—' }}</td>
                <td class="py-1.5">{{ fmtMethod(p.paymentMethod) }}</td>
                <td class="py-1.5">{{ p.referenceNumber || '—' }}</td>
                <td class="py-1.5 text-right font-medium">{{ Number(p.amount).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="summary" class="bg-white px-8 py-4">
          <div class="flex justify-end">
            <div class="w-56 space-y-1 text-sm">
              <div v-for="(info, method) in summary.byMethod" :key="method" class="flex justify-between">
                <span class="text-gray-500">{{ fmtMethod(method as string) }}</span>
                <span>{{ info.total.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between py-2 border-t-2 border-gray-900 font-bold">
                <span>Grand Total</span>
                <span>RM {{ summary.grandTotal.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-white px-8 py-6 border-t border-gray-200">
          <div class="grid grid-cols-2 gap-12">
            <div class="text-center"><div class="h-16"></div><div class="border-t border-gray-400 pt-2"><p class="text-xs font-semibold text-gray-700">PREPARED BY</p></div></div>
            <div class="text-center"><div class="h-16"></div><div class="border-t border-gray-400 pt-2"><p class="text-xs font-semibold text-gray-700">VERIFIED BY</p></div></div>
          </div>
        </div>
        <div class="bg-yellow-400 px-8 py-3 text-center border-t border-gray-200">
          <p class="text-gray-800 text-sm font-medium">Dream Garage (M) Sdn Bhd — Payment Log</p>
        </div>
      </div>
    </template>

    <!-- ═══ Payable Tab (A/P Payments) ═══ -->
    <template v-if="activeTab === 'payable'">
      <!-- Filters -->
      <div class="flex items-end gap-4 mb-6">
        <div class="flex-1 max-w-xs">
          <label class="block text-xs text-dark-400 mb-1">Search</label>
          <input v-model="apSearch" type="text" placeholder="Payment no, supplier..." class="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 placeholder:text-dark-500" />
        </div>
        <div>
          <label class="block text-xs text-dark-400 mb-1">From</label>
          <input v-model="apFrom" type="date" class="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
        </div>
        <div>
          <label class="block text-xs text-dark-400 mb-1">To</label>
          <input v-model="apTo" type="date" class="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
        </div>
      </div>

      <!-- Table -->
      <BaseTable :columns="apColumns" :data="apPayments" :loading="apLoading" empty-text="No payments found.">
        <template #cell-paymentNumber="{ value }">
          <span class="text-dark-100 font-mono font-medium">{{ value }}</span>
        </template>
        <template #cell-supplier="{ row }">
          <span class="text-dark-300 text-sm">{{ row.supplier?.companyName || '-' }}</span>
        </template>
        <template #cell-purchaseInvoice="{ row }">
          <span v-if="row.purchaseInvoice" class="text-dark-400 text-sm font-mono">{{ row.purchaseInvoice.internalNumber }}</span>
          <span v-else class="text-dark-500 text-sm">-</span>
        </template>
        <template #cell-amount="{ value }">
          <span class="text-red-400 font-medium">RM {{ Number(value).toFixed(2) }}</span>
        </template>
        <template #cell-paymentMethod="{ value }">
          <span class="text-dark-300 text-sm">{{ value?.replace('_', ' ') }}</span>
        </template>
        <template #cell-paymentDate="{ value }">
          <span class="text-dark-400 text-sm">{{ apFmtDate(value) }}</span>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center gap-1">
            <button @click="openReceipt(row)" class="p-1.5 text-dark-400 hover:text-gold-500 transition-colors" title="Print receipt">
              <Printer class="w-4 h-4" />
            </button>
            <button @click="handleDeleteAP(row)" class="p-1.5 text-dark-400 hover:text-red-400 transition-colors">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </template>
      </BaseTable>

      <!-- Printable Receipt -->
      <div v-if="receiptRow" class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 print:static print:bg-white print:p-0" @click.self="receiptRow = null">
        <div class="bg-white text-black rounded-lg shadow-xl w-[820px] max-w-full max-h-[90vh] overflow-auto print:shadow-none print:rounded-none print:max-h-none">
          <div class="flex items-center justify-end gap-2 p-3 border-b border-gray-200 print:hidden">
            <BaseButton variant="secondary" size="sm" @click="receiptRow = null">Close</BaseButton>
            <BaseButton variant="primary" size="sm" @click="handlePrintReceipt"><Printer class="w-4 h-4 mr-1" /> Print</BaseButton>
          </div>
          <div id="ap-receipt" class="p-10 font-sans">
            <div class="flex items-start justify-between border-b-2 border-black pb-4 mb-6">
              <div>
                <img src="/logo-invoice.png" alt="Dream Garage" class="h-14 mb-2" />
                <p class="text-xs text-gray-700 font-semibold">{{ branch?.name || 'DREAM GARAGE (M) SDN BHD' }}</p>
                <p class="text-[11px] text-gray-600">{{ branch?.address }}</p>
                <p class="text-[11px] text-gray-600">{{ branch?.phone }} · {{ branch?.email }}</p>
                <p v-if="branch?.ssmNumber" class="text-[11px] text-gray-600">SSM: {{ branch?.ssmNumber }}</p>
              </div>
              <div class="text-right">
                <h2 class="text-2xl font-bold tracking-widest">PAYMENT RECEIPT</h2>
                <p class="text-xs text-gray-600 mt-1">A/P Payment Voucher</p>
                <p class="text-sm font-mono mt-2">{{ receiptRow.paymentNumber }}</p>
                <p class="text-xs text-gray-600">{{ apFmtDate(receiptRow.paymentDate) }}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-8 mb-6 text-sm">
              <div>
                <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Paid To</p>
                <p class="font-semibold">{{ receiptRow.supplier?.companyName || '—' }}</p>
                <p v-if="receiptRow.supplier?.contactName" class="text-xs text-gray-600">{{ receiptRow.supplier?.contactName }}</p>
                <p v-if="receiptRow.supplier?.phone" class="text-xs text-gray-600">{{ receiptRow.supplier?.phone }}</p>
              </div>
              <div>
                <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Payment Details</p>
                <div class="text-xs space-y-0.5">
                  <div class="flex justify-between"><span class="text-gray-500">Method</span><span>{{ receiptRow.paymentMethod?.replace('_', ' ') }}</span></div>
                  <div v-if="receiptRow.bankName" class="flex justify-between"><span class="text-gray-500">Bank</span><span>{{ receiptRow.bankName }}</span></div>
                  <div v-if="receiptRow.referenceNumber" class="flex justify-between"><span class="text-gray-500">Reference</span><span class="font-mono">{{ receiptRow.referenceNumber }}</span></div>
                  <div v-if="receiptRow.purchaseInvoice" class="flex justify-between"><span class="text-gray-500">Applied to</span><span class="font-mono">{{ receiptRow.purchaseInvoice.internalNumber }}</span></div>
                </div>
              </div>
            </div>
            <div class="border-t-2 border-b-2 border-black py-4 mb-4">
              <div class="flex items-end justify-between">
                <div>
                  <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Amount (in words)</p>
                  <p class="text-sm italic">{{ amountInWords(Number(receiptRow.amount)) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Paid</p>
                  <p class="text-3xl font-bold">RM {{ Number(receiptRow.amount).toFixed(2) }}</p>
                </div>
              </div>
            </div>
            <p v-if="receiptRow.notes" class="text-xs text-gray-700 mb-8"><span class="text-gray-500">Notes: </span>{{ receiptRow.notes }}</p>
            <div class="grid grid-cols-2 gap-12 mt-16 text-xs">
              <div><div class="border-t border-gray-400 pt-1 text-center">Prepared by</div></div>
              <div><div class="border-t border-gray-400 pt-1 text-center">Authorised signature</div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Payment Modal -->
      <BaseModal v-model="showCreateModal" title="Record Supplier Payment" size="md">
        <div class="space-y-4">
          <BaseSelect v-model="payForm.supplierId" label="Supplier" required>
            <option v-for="s in apSuppliers" :key="s.id" :value="s.id">{{ s.companyName }}</option>
          </BaseSelect>
          <BaseInput v-model="payForm.amount" label="Amount (RM)" type="number" step="0.01" min="0.01" required />
          <BaseSelect v-model="payForm.paymentMethod" label="Payment Method" required>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CHEQUE">Cheque</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="TNG">Touch 'n Go</option>
            <option value="BOOST">Boost</option>
          </BaseSelect>
          <BaseInput v-model="payForm.referenceNumber" label="Reference Number" placeholder="Optional" />
          <BaseInput v-model="payForm.bankName" label="Bank Name" placeholder="Optional" />
          <BaseInput v-model="payForm.notes" label="Notes" placeholder="Optional" />
          <BaseInput v-model="payForm.paymentDate" label="Payment Date" type="date" />
        </div>
        <template #footer>
          <BaseButton variant="secondary" @click="showCreateModal = false">Cancel</BaseButton>
          <BaseButton variant="primary" :loading="apSaving" @click="handleCreateAP">Record Payment</BaseButton>
        </template>
      </BaseModal>

      <!-- Delete Confirm Modal -->
      <BaseModal v-model="showDeleteModal" title="Delete Payment" size="sm">
        <p class="text-dark-300 text-sm">Are you sure you want to delete <strong class="text-dark-100">{{ deleteTarget?.paymentNumber }}</strong>?</p>
        <template #footer>
          <BaseButton variant="secondary" @click="showDeleteModal = false">Cancel</BaseButton>
          <BaseButton variant="danger" :loading="apDeleting" @click="confirmDeleteAP">Delete</BaseButton>
        </template>
      </BaseModal>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, onUnmounted, watch } from 'vue'
import api from '../../lib/api'
import { useToast } from '../../composables/useToast'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseTable from '../../components/base/BaseTable.vue'
import BasePagination from '../../components/base/BasePagination.vue'
import BaseBadge from '../../components/base/BaseBadge.vue'
import BaseModal from '../../components/base/BaseModal.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseSelect from '../../components/base/BaseSelect.vue'
import { Search, Printer, FileSpreadsheet, FileText, Plus, Trash2 } from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const toast = useToast()
const activeTab = ref<'received' | 'payable'>('received')

// ═══════════════════════════════════════════════════
// RECEIVED (Payment Log)
// ═══════════════════════════════════════════════════
const activeMethod = ref('')
const search = ref('')
const dateFrom = ref(new Date().toISOString().split('T')[0])
const dateTo = ref(new Date().toISOString().split('T')[0])
const loading = ref(true)
const payments = ref<any[]>([])
const allPaymentsForPrint = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(20)
const summary = ref<{ grandTotal: number; totalPayments: number; byMethod: Record<string, { total: number; count: number }>; dateFrom: string; dateTo: string } | null>(null)

const methodTabs = [
  { value: '', label: 'All Methods' },
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'EWALLET', label: 'E-Wallet' },
  { value: 'TNG', label: "Touch 'n Go" },
  { value: 'BOOST', label: 'Boost' },
  { value: 'CHEQUE', label: 'Cheque' },
]

const columns = [
  { key: 'createdAt', label: 'Date/Time' },
  { key: 'documentNumber', label: 'Invoice' },
  { key: 'customerName', label: 'Customer' },
  { key: 'paymentMethod', label: 'Method' },
  { key: 'referenceNumber', label: 'Reference' },
  { key: 'amount', label: 'Amount (RM)' },
  { key: 'createdBy', label: 'By' },
]

function fmtMethod(m: string) {
  const labels: Record<string, string> = { CASH: 'Cash', BANK_TRANSFER: 'Bank Transfer', CHEQUE: 'Cheque', CREDIT_CARD: 'Credit Card', EWALLET: 'E-Wallet', TNG: "Touch 'n Go", BOOST: 'Boost' }
  return labels[m] || m
}
function methodColor(m: string): 'green' | 'blue' | 'gray' | 'gold' {
  if (m === 'CASH') return 'green'
  if (['BANK_TRANSFER', 'CREDIT_CARD'].includes(m)) return 'blue'
  if (['TNG', 'BOOST', 'EWALLET'].includes(m)) return 'gold'
  return 'gray'
}
function fmtDateTime(d: string) {
  const dt = new Date(d)
  return dt.toLocaleDateString('en-MY', { day: '2-digit', month: 'short' }) + ' ' + dt.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
}
function switchMethod(method: string) { activeMethod.value = method; page.value = 1; fetchData() }

let debounceTimer: ReturnType<typeof setTimeout>
function debouncedFetch() { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => { page.value = 1; fetchData() }, 300) }

async function fetchData() {
  loading.value = true
  try {
    const { data } = await api.get('/reports/payment-log', { params: { page: page.value, limit: limit.value, from: dateFrom.value || undefined, to: dateTo.value || undefined, method: activeMethod.value || undefined, search: search.value || undefined } })
    payments.value = data.data; total.value = data.total; summary.value = data.summary
  } catch { /* ignore */ } finally { loading.value = false }
}

async function printLog() {
  try { const { data } = await api.get('/reports/payment-log', { params: { page: 1, limit: 9999, from: dateFrom.value || undefined, to: dateTo.value || undefined, method: activeMethod.value || undefined, search: search.value || undefined } }); allPaymentsForPrint.value = data.data } catch { allPaymentsForPrint.value = payments.value }
  await nextTick(); window.print()
}

async function getAllPayments() {
  try { const { data } = await api.get('/reports/payment-log', { params: { page: 1, limit: 9999, from: dateFrom.value || undefined, to: dateTo.value || undefined, method: activeMethod.value || undefined, search: search.value || undefined } }); return data.data as any[] } catch { return payments.value }
}

async function exportExcel() {
  const all = await getAllPayments()
  const rows = all.map((p: any, i: number) => ({ 'No': i + 1, 'Date/Time': fmtDateTime(p.createdAt), 'Invoice': p.documentNumber, 'Customer': p.customerName || '—', 'Vehicle': p.vehiclePlate || '—', 'Method': fmtMethod(p.paymentMethod), 'Reference': p.referenceNumber || '—', 'Amount (RM)': Number(p.amount).toFixed(2) }))
  rows.push({} as any)
  if (summary.value) {
    for (const [method, info] of Object.entries(summary.value.byMethod)) rows.push({ 'No': '' as any, 'Date/Time': '', 'Invoice': '', 'Customer': '', 'Vehicle': '', 'Method': fmtMethod(method), 'Reference': 'Subtotal', 'Amount (RM)': info.total.toFixed(2) })
    rows.push({ 'No': '' as any, 'Date/Time': '', 'Invoice': '', 'Customer': '', 'Vehicle': '', 'Method': '', 'Reference': 'Grand Total', 'Amount (RM)': summary.value.grandTotal.toFixed(2) })
  }
  const ws = XLSX.utils.json_to_sheet(rows); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Payment Log'); XLSX.writeFile(wb, `payment-log-${dateFrom.value}-to-${dateTo.value}.xlsx`)
}

async function exportPdf() {
  const all = await getAllPayments()
  const doc = new jsPDF(); const pw = doc.internal.pageSize.width
  doc.setFillColor(17, 18, 23); doc.rect(0, 0, pw, 28, 'F')
  doc.setTextColor(255, 215, 0); doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.text('DREAM GARAGE (M) SDN BHD', 14, 12)
  doc.setTextColor(200, 200, 200); doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.text('22, Jalan Mutiara Emas 5/1, Taman Mount Austin, 81100 Johor Bahru, Johor', 14, 18); doc.text('Tel: +60 18-207 8080', 14, 23)
  doc.setTextColor(0); doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.text('PAYMENT LOG', 14, 38)
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(100)
  const filterParts = [`Period: ${fmtDate(dateFrom.value)} — ${fmtDate(dateTo.value)}`]; if (activeMethod.value) filterParts.push(`Method: ${fmtMethod(activeMethod.value)}`); if (search.value) filterParts.push(`Search: ${search.value}`)
  doc.text(filterParts.join('  |  '), 14, 44); doc.text(`Printed: ${fmtDate(new Date().toISOString().split('T')[0])}`, pw - 14, 44, { align: 'right' })
  if (summary.value) { doc.setTextColor(0); const sp = [`Transactions: ${summary.value.totalPayments}`]; for (const [m, info] of Object.entries(summary.value.byMethod)) sp.push(`${fmtMethod(m)}: RM ${info.total.toFixed(2)} (${info.count})`); doc.text(sp.join('   |   '), 14, 50) }
  const pdfRows = all.map((p: any, i: number) => [i + 1, fmtDateTime(p.createdAt), p.documentNumber, p.customerName || '—', fmtMethod(p.paymentMethod), p.referenceNumber || '—', Number(p.amount).toFixed(2)])
  autoTable(doc, { startY: 56, head: [['No', 'Date/Time', 'Invoice', 'Customer', 'Method', 'Ref', 'Amount (RM)']], body: pdfRows, styles: { fontSize: 7, cellPadding: 2.5 }, headStyles: { fillColor: [17, 18, 23], textColor: [255, 215, 0], fontStyle: 'bold' }, alternateRowStyles: { fillColor: [245, 245, 245] }, columnStyles: { 6: { halign: 'right' } } })
  const finalY = (doc as any).lastAutoTable?.finalY || 200
  if (summary.value) { let y = finalY + 6; doc.setFontSize(8); for (const [m, info] of Object.entries(summary.value.byMethod)) { doc.setTextColor(100); doc.text(fmtMethod(m), pw - 70, y); doc.setTextColor(0); doc.text(`RM ${info.total.toFixed(2)}`, pw - 14, y, { align: 'right' }); y += 5 }; doc.setDrawColor(17, 18, 23); doc.setLineWidth(0.5); doc.line(pw - 70, y, pw - 14, y); y += 5; doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.text('Grand Total', pw - 70, y); doc.text(`RM ${summary.value.grandTotal.toFixed(2)}`, pw - 14, y, { align: 'right' }); y += 12; const sigY = y + 20; doc.setDrawColor(150); doc.setLineWidth(0.3); doc.line(14, sigY, 80, sigY); doc.line(pw - 80, sigY, pw - 14, sigY); doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(80); doc.text('PREPARED BY', 47, sigY + 5, { align: 'center' }); doc.text('VERIFIED BY', pw - 47, sigY + 5, { align: 'center' }) }
  const ph = doc.internal.pageSize.height; doc.setFillColor(255, 215, 0); doc.rect(0, ph - 12, pw, 12, 'F'); doc.setTextColor(30, 30, 30); doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.text('Dream Garage (M) Sdn Bhd — Payment Log', pw / 2, ph - 5, { align: 'center' })
  doc.save(`payment-log-${dateFrom.value}-to-${dateTo.value}.pdf`)
}

// ═══════════════════════════════════════════════════
// PAYABLE (A/P Payments)
// ═══════════════════════════════════════════════════
const apPayments = ref<any[]>([])
const apSuppliers = ref<any[]>([])
const apLoading = ref(false)
const apSaving = ref(false)
const apDeleting = ref(false)
const apLoaded = ref(false)
const apSearch = ref('')
const apFrom = ref('')
const apTo = ref('')
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const deleteTarget = ref<any>(null)
const receiptRow = ref<any>(null)
const branch = ref<any>(null)

const payForm = reactive({ supplierId: '', amount: '', paymentMethod: 'BANK_TRANSFER', referenceNumber: '', bankName: '', notes: '', paymentDate: new Date().toISOString().split('T')[0] })

const apColumns = [
  { key: 'paymentNumber', label: 'Pay No.' },
  { key: 'supplier', label: 'Supplier' },
  { key: 'purchaseInvoice', label: 'PI No.' },
  { key: 'amount', label: 'Amount' },
  { key: 'paymentMethod', label: 'Method' },
  { key: 'paymentDate', label: 'Date' },
]

function apFmtDate(d: string) { return new Date(d).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }) }

let apTimer: ReturnType<typeof setTimeout>
watch([apSearch, apFrom, apTo], () => { clearTimeout(apTimer); apTimer = setTimeout(() => fetchAP(), 300) })

async function fetchAP() {
  apLoading.value = true
  try {
    const params: Record<string, any> = { limit: 50 }; if (apSearch.value) params.search = apSearch.value; if (apFrom.value) params.from = apFrom.value; if (apTo.value) params.to = apTo.value
    const { data } = await api.get('/supplier-payments', { params }); apPayments.value = data.data; apLoaded.value = true
  } catch { /* ignore */ } finally { apLoading.value = false }
}

async function fetchSuppliers() { try { const { data } = await api.get('/suppliers', { params: { limit: 100 } }); apSuppliers.value = data.data } catch { /* ignore */ } }

async function handleCreateAP() {
  apSaving.value = true
  try {
    await api.post('/supplier-payments', { ...payForm, amount: Number(payForm.amount) })
    toast.success('Payment recorded'); showCreateModal.value = false; payForm.amount = ''; payForm.referenceNumber = ''; payForm.notes = ''; fetchAP()
  } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to create payment') } finally { apSaving.value = false }
}

function handleDeleteAP(row: any) { deleteTarget.value = row; showDeleteModal.value = true }

async function confirmDeleteAP() {
  if (!deleteTarget.value) return
  apDeleting.value = true
  try {
    await api.delete(`/supplier-payments/${deleteTarget.value.id}`); toast.success('Payment deleted'); showDeleteModal.value = false; fetchAP()
  } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to delete') } finally { apDeleting.value = false }
}

async function openReceipt(row: any) {
  receiptRow.value = row
  if (!branch.value) { try { const { data } = await api.get('/profile'); branch.value = data.data.branch } catch { /* ignore */ } }
}

function handlePrintReceipt() {
  const receiptEl = document.getElementById('ap-receipt'); if (!receiptEl) return window.print()
  const w = window.open('', '_blank', 'width=900,height=1100'); if (!w) return window.print()
  w.document.write(`<!doctype html><html><head><title>${receiptRow.value?.paymentNumber || 'Receipt'}</title><script src="https://cdn.tailwindcss.com"><\/script></head><body>${receiptEl.outerHTML}<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),300)}<\/script></body></html>`); w.document.close()
}

function amountInWords(amount: number): string {
  const below20 = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  function under1000(n: number): string { if (n === 0) return ''; if (n < 20) return below20[n]; if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + below20[n % 10] : ''); return below20[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + under1000(n % 100) : '') }
  const ringgit = Math.floor(amount); const sen = Math.round((amount - ringgit) * 100)
  const parts: string[] = []; let r = ringgit
  if (r >= 1_000_000) { parts.push(under1000(Math.floor(r / 1_000_000)) + ' Million'); r %= 1_000_000 }
  if (r >= 1000) { parts.push(under1000(Math.floor(r / 1000)) + ' Thousand'); r %= 1000 }
  if (r > 0) parts.push(under1000(r))
  return `Ringgit Malaysia ${parts.join(' ') || 'Zero'}${sen > 0 ? ' and ' + under1000(sen) + ' Sen' : ''} Only`
}

// ═══════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════
onMounted(() => { fetchData(); fetchSuppliers() })
onUnmounted(() => { clearTimeout(debounceTimer); clearTimeout(apTimer) })
</script>

<style>
@media print {
  body * { visibility: hidden; }
  #payment-log-print, #payment-log-print * {
    visibility: visible;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  #payment-log-print {
    display: block !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    max-width: 100%;
  }
}
</style>
