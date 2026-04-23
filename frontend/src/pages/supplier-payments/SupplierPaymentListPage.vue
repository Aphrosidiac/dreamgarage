<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-dark-100">A/P Payments</h2>
      <BaseButton variant="primary" size="sm" @click="showCreateModal = true">
        <Plus class="w-4 h-4 mr-1" /> Record Payment
      </BaseButton>
    </div>

    <!-- Filters -->
    <div class="flex items-end gap-4 mb-6">
      <div class="flex-1 max-w-xs">
        <label class="block text-xs text-dark-400 mb-1">Search</label>
        <input v-model="search" type="text" placeholder="Payment no, supplier..." class="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 placeholder:text-dark-500" />
      </div>
      <div>
        <label class="block text-xs text-dark-400 mb-1">From</label>
        <input v-model="filterFrom" type="date" class="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
      </div>
      <div>
        <label class="block text-xs text-dark-400 mb-1">To</label>
        <input v-model="filterTo" type="date" class="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
      </div>
    </div>

    <!-- Table -->
    <BaseTable :columns="columns" :data="payments" :loading="loading" empty-text="No payments found.">
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
        <span class="text-dark-400 text-sm">{{ formatDate(value) }}</span>
      </template>
      <template #actions="{ row }">
        <button @click="openReceipt(row)" class="p-1.5 text-dark-400 hover:text-gold-500 transition-colors" title="Payment Voucher">
          <Printer class="w-4 h-4" />
        </button>
        <button @click="handleDelete(row)" class="p-1.5 text-dark-400 hover:text-red-400 transition-colors">
          <Trash2 class="w-4 h-4" />
        </button>
      </template>
    </BaseTable>

    <!-- Payment Voucher -->
    <div v-if="receiptRow" class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 print:static print:bg-white print:p-0" @click.self="receiptRow = null">
      <div class="bg-white text-black rounded-lg shadow-xl w-[820px] max-w-full max-h-[90vh] overflow-auto print:shadow-none print:rounded-none print:max-h-none">
        <div class="flex items-center justify-end gap-2 p-3 border-b border-gray-200 print:hidden">
          <BaseButton variant="secondary" size="sm" @click="receiptRow = null">Close</BaseButton>
          <BaseButton variant="primary" size="sm" @click="handlePrint"><Printer class="w-4 h-4 mr-1" /> Print</BaseButton>
        </div>
        <div id="ap-receipt" class="p-8 font-sans text-[13px]">
          <!-- Header -->
          <div class="flex items-start justify-between border-b-2 border-black pb-3 mb-4">
            <div>
              <img src="/logo-invoice.png" alt="Dream Garage" class="h-12 mb-1" />
              <p class="text-sm font-bold">{{ branch?.name || 'DREAM GARAGE (M) SDN BHD' }}</p>
              <p v-if="branch?.ssmNumber" class="text-[11px] text-gray-600">{{ branch?.ssmNumber }}</p>
              <p class="text-[11px] text-gray-600">{{ branch?.address }}</p>
              <p class="text-[11px] text-gray-600">Tel: {{ branch?.phone }}{{ branch?.email ? ' · ' + branch.email : '' }}</p>
            </div>
            <div class="text-right">
              <h2 class="text-xl font-bold tracking-wider mb-2">PAYMENT VOUCHER</h2>
              <table class="text-xs ml-auto">
                <tr><td class="text-gray-500 pr-3 text-right">No.:</td><td class="font-mono font-semibold">{{ receiptRow.paymentNumber }}</td></tr>
                <tr><td class="text-gray-500 pr-3 text-right">Date:</td><td>{{ formatDate(receiptRow.paymentDate) }}</td></tr>
                <tr><td class="text-gray-500 pr-3 text-right whitespace-nowrap">{{ receiptRow.paymentMethod === 'CHEQUE' ? 'Cheque No.:' : 'Ref No.:' }}</td><td class="font-mono">{{ receiptRow.referenceNumber || '-' }}</td></tr>
                <tr><td class="text-gray-500 pr-3 text-right whitespace-nowrap">Payment By:</td><td>{{ pvMethodLabel(receiptRow.paymentMethod) }}</td></tr>
              </table>
            </div>
          </div>

          <!-- Pay To -->
          <div class="mb-3">
            <div class="flex gap-2 text-sm">
              <span class="text-gray-500 shrink-0">PAY TO:</span>
              <span class="font-semibold">{{ receiptRow.supplier?.companyName || '-' }}</span>
            </div>
          </div>

          <!-- Pay The Sum Of -->
          <div class="border border-gray-300 rounded px-3 py-2 mb-4 bg-gray-50">
            <div class="flex gap-2 text-sm">
              <span class="text-gray-500 shrink-0 text-xs uppercase">Pay the sum of:</span>
              <span class="font-semibold uppercase text-xs">{{ amountInWords(Number(receiptRow.amount)) }}</span>
            </div>
          </div>

          <!-- Payment Details Table -->
          <div class="mb-4">
            <p class="text-xs font-semibold text-gray-600 mb-1 uppercase">Payment Details</p>
            <table class="w-full border-collapse text-xs">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border border-gray-300 px-2 py-1.5 text-left">Inv. Date</th>
                  <th class="border border-gray-300 px-2 py-1.5 text-left">Inv. No</th>
                  <th class="border border-gray-300 px-2 py-1.5 text-right">Total Amt</th>
                  <th class="border border-gray-300 px-2 py-1.5 text-right">Outstanding</th>
                  <th class="border border-gray-300 px-2 py-1.5 text-right">Paid Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="receiptRow.purchaseInvoice">
                  <td class="border border-gray-300 px-2 py-1.5">{{ formatDate(receiptRow.purchaseInvoice.issueDate) }}</td>
                  <td class="border border-gray-300 px-2 py-1.5 font-mono">{{ receiptRow.purchaseInvoice.internalNumber }}</td>
                  <td class="border border-gray-300 px-2 py-1.5 text-right">{{ fmtRM(receiptRow.purchaseInvoice.totalAmount) }}</td>
                  <td class="border border-gray-300 px-2 py-1.5 text-right">{{ fmtRM(Number(receiptRow.purchaseInvoice.totalAmount) - Number(receiptRow.purchaseInvoice.paidAmount)) }}</td>
                  <td class="border border-gray-300 px-2 py-1.5 text-right font-semibold">{{ fmtRM(receiptRow.amount) }}</td>
                </tr>
                <tr v-else>
                  <td class="border border-gray-300 px-2 py-1.5">{{ formatDate(receiptRow.paymentDate) }}</td>
                  <td class="border border-gray-300 px-2 py-1.5 text-gray-400">-</td>
                  <td class="border border-gray-300 px-2 py-1.5 text-right">-</td>
                  <td class="border border-gray-300 px-2 py-1.5 text-right">-</td>
                  <td class="border border-gray-300 px-2 py-1.5 text-right font-semibold">{{ fmtRM(receiptRow.amount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Notes -->
          <p v-if="receiptRow.notes" class="text-xs text-gray-600 mb-4"><span class="text-gray-400">Notes: </span>{{ receiptRow.notes }}</p>

          <!-- Total -->
          <div class="flex justify-end mb-8">
            <div class="border-t-2 border-black pt-2 px-4 text-right">
              <span class="text-xs text-gray-500 mr-4">TOTAL:</span>
              <span class="text-lg font-bold">RM {{ Number(receiptRow.amount).toFixed(2) }}</span>
            </div>
          </div>

          <!-- Signatures -->
          <div class="grid grid-cols-2 gap-16 mt-12 text-xs">
            <div>
              <div class="border-t border-gray-400 pt-1 text-center">Approved By</div>
            </div>
            <div>
              <div class="border-t border-gray-400 pt-1 text-center">Received By</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Payment Modal -->
    <BaseModal v-model="showCreateModal" title="Record Supplier Payment" size="md">
      <div class="space-y-4">
        <BaseSelect v-model="payForm.supplierId" label="Supplier" required>
          <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.companyName }}</option>
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
        <BaseButton variant="primary" :loading="saving" @click="handleCreate">Record Payment</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import api from '../../lib/api'
import { useToast } from '../../composables/useToast'
import BaseTable from '../../components/base/BaseTable.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseModal from '../../components/base/BaseModal.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseSelect from '../../components/base/BaseSelect.vue'
import { Plus, Trash2, Printer } from 'lucide-vue-next'

const toast = useToast()

const payments = ref<any[]>([])
const suppliers = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const search = ref('')
const filterFrom = ref('')
const filterTo = ref('')
const showCreateModal = ref(false)

const payForm = reactive({
  supplierId: '',
  amount: '',
  paymentMethod: 'BANK_TRANSFER',
  referenceNumber: '',
  bankName: '',
  notes: '',
  paymentDate: new Date().toISOString().split('T')[0],
})

const columns = [
  { key: 'paymentNumber', label: 'Pay No.' },
  { key: 'supplier', label: 'Supplier' },
  { key: 'purchaseInvoice', label: 'PI No.' },
  { key: 'amount', label: 'Amount' },
  { key: 'paymentMethod', label: 'Method' },
  { key: 'paymentDate', label: 'Date' },
]

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
}

let searchTimeout: ReturnType<typeof setTimeout>
watch([search, filterFrom, filterTo], () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchPayments(), 300)
})

async function fetchPayments() {
  loading.value = true
  try {
    const params: Record<string, any> = { limit: 50 }
    if (search.value) params.search = search.value
    if (filterFrom.value) params.from = filterFrom.value
    if (filterTo.value) params.to = filterTo.value
    const { data } = await api.get('/supplier-payments', { params })
    payments.value = data.data
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

async function fetchSuppliers() {
  try {
    const { data } = await api.get('/suppliers', { params: { limit: 100 } })
    suppliers.value = data.data
  } catch { /* ignore */ }
}

async function handleCreate() {
  saving.value = true
  try {
    await api.post('/supplier-payments', {
      ...payForm,
      amount: Number(payForm.amount),
    })
    toast.success('Payment recorded')
    showCreateModal.value = false
    payForm.amount = ''
    payForm.referenceNumber = ''
    payForm.notes = ''
    fetchPayments()
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to create payment')
  } finally {
    saving.value = false
  }
}

async function handleDelete(payment: any) {
  if (!confirm(`Delete payment ${payment.paymentNumber}?`)) return
  try {
    await api.delete(`/supplier-payments/${payment.id}`)
    toast.success('Payment deleted')
    fetchPayments()
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to delete')
  }
}

const receiptRow = ref<any>(null)
const branch = ref<any>(null)

function fmtRM(v: any) { return 'RM ' + Number(v).toFixed(2) }

function pvMethodLabel(method: string) {
  const map: Record<string, string> = {
    CASH: 'Cash', BANK_TRANSFER: 'Bank Transfer', CHEQUE: 'Cheque',
    CREDIT_CARD: 'Credit Card', TNG: "Touch 'n Go", BOOST: 'Boost', EWALLET: 'E-Wallet',
  }
  return map[method] || method?.replace('_', ' ')
}

async function openReceipt(row: any) {
  receiptRow.value = row
  if (!branch.value) {
    try {
      const { data } = await api.get('/profile')
      branch.value = data.data.branch
    } catch { /* ignore */ }
  }
}

function handlePrint() {
  const receiptEl = document.getElementById('ap-receipt')
  if (!receiptEl) return window.print()
  const w = window.open('', '_blank', 'width=900,height=1100')
  if (!w) return window.print()
  w.document.write(`<!doctype html><html><head><title>${receiptRow.value?.paymentNumber || 'Payment Voucher'}</title><script src="https://cdn.tailwindcss.com"><\/script></head><body>${receiptEl.outerHTML}<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),300)}<\/script></body></html>`)
  w.document.close()
}

function amountInWords(amount: number): string {
  // Minimal English number-to-words for RM amounts
  const below20 = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  function under1000(n: number): string {
    if (n === 0) return ''
    if (n < 20) return below20[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + below20[n % 10] : '')
    return below20[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + under1000(n % 100) : '')
  }
  const ringgit = Math.floor(amount)
  const sen = Math.round((amount - ringgit) * 100)
  const ringgitParts: string[] = []
  let r = ringgit
  if (r >= 1_000_000) { ringgitParts.push(under1000(Math.floor(r / 1_000_000)) + ' Million'); r %= 1_000_000 }
  if (r >= 1000) { ringgitParts.push(under1000(Math.floor(r / 1000)) + ' Thousand'); r %= 1000 }
  if (r > 0) ringgitParts.push(under1000(r))
  const ringgitStr = ringgitParts.join(' ') || 'Zero'
  return `Ringgit Malaysia ${ringgitStr}${sen > 0 ? ' and ' + under1000(sen) + ' Sen' : ''} Only`
}

onMounted(() => {
  fetchPayments()
  fetchSuppliers()
})
</script>
