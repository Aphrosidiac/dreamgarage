<template>
  <div>
    <!-- Action Bar -->
    <div class="flex items-center justify-between mb-6 print:hidden">
      <div class="flex items-center gap-3">
        <button @click="$router.back()" class="text-dark-400 hover:text-dark-200 transition-colors">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h2 class="text-lg font-semibold text-dark-100">{{ doc?.documentNumber }}</h2>
        <BaseBadge v-if="doc" :color="store.getStatusColor(doc.status) as any">{{ doc.status }}</BaseBadge>
      </div>
      <div v-if="doc" class="flex items-center gap-2">
        <!-- Status Actions -->
        <template v-if="doc.documentType === 'INVOICE'">
          <BaseButton v-if="doc.status === 'DRAFT'" variant="primary" size="sm" @click="handleStatus('OUTSTANDING')" :loading="statusLoading">
            <Send class="w-4 h-4 mr-1" /> Issue Invoice
          </BaseButton>
          <BaseButton v-if="['OUTSTANDING', 'PARTIAL'].includes(doc.status)" variant="primary" size="sm" @click="showPaymentModal = true">
            <CreditCard class="w-4 h-4 mr-1" /> Record Payment
          </BaseButton>
          <BaseButton v-if="doc.status !== 'VOID' && doc.status !== 'DRAFT'" variant="danger" size="sm" @click="handleStatus('VOID')" :loading="statusLoading">
            Void
          </BaseButton>
        </template>
        <template v-if="doc.documentType === 'QUOTATION'">
          <BaseButton v-if="doc.status === 'DRAFT'" variant="primary" size="sm" @click="handleStatus('APPROVED')">Approve</BaseButton>
          <BaseButton v-if="doc.status === 'APPROVED'" variant="secondary" size="sm" @click="handleStatus('SENT')">Mark as Sent</BaseButton>
        </template>
        <template v-if="doc.documentType === 'DELIVERY_ORDER'">
          <BaseButton v-if="doc.status === 'DRAFT'" variant="primary" size="sm" @click="handleStatus('APPROVED')">Approve</BaseButton>
          <BaseButton v-if="doc.status === 'APPROVED'" variant="primary" size="sm" @click="handleStatus('COMPLETED')">Mark Delivered</BaseButton>
        </template>

        <!-- Convert -->
        <BaseButton
          v-for="target in (doc.conversionTargets || [])"
          :key="target"
          variant="secondary" size="sm"
          @click="handleConvert(target)"
          :loading="converting"
        >
          <ArrowRightLeft class="w-4 h-4 mr-1" /> Convert to {{ store.getDocTypeLabel(target) }}
        </BaseButton>

        <!-- Edit -->
        <RouterLink v-if="['DRAFT', 'PENDING'].includes(doc.status)" :to="`/app/documents/${doc.id}/edit`">
          <BaseButton variant="secondary" size="sm"><Pencil class="w-4 h-4 mr-1" /> Edit</BaseButton>
        </RouterLink>

        <!-- Export -->
        <BaseButton variant="secondary" size="sm" @click="exportAsImage" :loading="exporting">
          <Download class="w-4 h-4 mr-1" /> Export PNG
        </BaseButton>
        <BaseButton variant="secondary" size="sm" @click="handlePrint">
          <Printer class="w-4 h-4 mr-1" /> Print
        </BaseButton>
      </div>
    </div>

    <!-- Conversion Lineage -->
    <div v-if="doc?.convertedFromId" class="bg-dark-900 border border-dark-800 rounded-xl p-4 mb-4 flex items-center gap-2 text-sm print:hidden">
      <GitBranch class="w-4 h-4 text-gold-500" />
      <span class="text-dark-400">Converted from</span>
      <RouterLink :to="`/app/documents/${doc.convertedFromId}`" class="text-gold-500 hover:text-gold-400 font-mono">
        {{ doc.convertedFromType }}
      </RouterLink>
    </div>

    <div v-if="loadingDoc" class="text-dark-400">Loading...</div>

    <!-- Document Template -->
    <div v-else-if="doc" id="document-template" class="text-gray-900 overflow-hidden max-w-3xl mx-auto rounded-xl print:max-w-full print:shadow-none print:rounded-none" style="width: 800px;">
      <!-- Header -->
      <div class="bg-gray-900 text-white px-8 py-6 flex items-center gap-4">
        <img src="/logo-doc.png" alt="Dream Garage" class="h-16" />
        <div class="flex-1">
          <h1 class="text-xl font-bold text-yellow-400">DREAM GARAGE (M) SDN BHD</h1>
          <p class="text-gray-300 text-sm mt-1">22, Jalan Mutiara Emas 5/1, Taman Mount Austin, 81100 Johor Bahru, Johor</p>
          <p class="text-gray-300 text-sm">Tel: +60 18-207 8080</p>
        </div>
      </div>

      <!-- Doc Info -->
      <div class="bg-white px-8 py-4 border-b border-gray-200 flex justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-900 uppercase">{{ store.getDocTypeLabel(doc.documentType) }}</h2>
        </div>
        <div class="text-right text-sm space-y-0.5">
          <p><span class="text-gray-500">No:</span> <strong>{{ doc.documentNumber }}</strong></p>
          <p><span class="text-gray-500">Date:</span> {{ fmtDate(doc.issueDate) }}</p>
          <p v-if="doc.dueDate"><span class="text-gray-500">Due:</span> {{ fmtDate(doc.dueDate) }}</p>
          <p><span class="text-gray-500">Status:</span> {{ doc.status }}</p>
        </div>
      </div>

      <!-- Customer & Vehicle -->
      <div v-if="doc.customerName || doc.vehiclePlate" class="bg-white px-8 py-4 border-b border-gray-200 grid grid-cols-2 gap-6 text-sm">
        <div v-if="doc.customerName">
          <p class="text-gray-500 text-xs uppercase font-semibold mb-1">Customer</p>
          <p class="font-medium">{{ doc.customerName }}</p>
          <p v-if="doc.customerPhone" class="text-gray-500">{{ doc.customerPhone }}</p>
          <p v-if="doc.customerEmail" class="text-gray-500">{{ doc.customerEmail }}</p>
        </div>
        <div v-if="doc.vehiclePlate">
          <p class="text-gray-500 text-xs uppercase font-semibold mb-1">Vehicle</p>
          <p class="font-medium">{{ doc.vehiclePlate }}</p>
          <p v-if="doc.vehicleModel" class="text-gray-500">{{ doc.vehicleModel }}</p>
          <p v-if="doc.vehicleMileage" class="text-gray-500">{{ doc.vehicleMileage }} KM</p>
        </div>
      </div>

      <!-- Items Table -->
      <div class="bg-white px-8 py-4">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b-2 border-gray-900">
              <th class="text-left py-2 font-semibold w-8">No</th>
              <th class="text-left py-2 font-semibold">Description</th>
              <th class="text-center py-2 font-semibold w-12">Qty</th>
              <th class="text-left py-2 font-semibold w-12">Unit</th>
              <th class="text-right py-2 font-semibold w-20">Price</th>
              <th v-if="hasDiscount" class="text-right py-2 font-semibold w-12">Disc%</th>
              <th v-if="hasTax" class="text-right py-2 font-semibold w-12">Tax%</th>
              <th class="text-right py-2 font-semibold w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in doc.items" :key="item.id" class="border-b border-gray-100">
              <td class="py-2">{{ idx + 1 }}</td>
              <td class="py-2">
                <span v-if="item.itemCode" class="font-mono text-gray-500 text-xs">{{ item.itemCode }} </span>
                {{ item.description }}
              </td>
              <td class="py-2 text-center">{{ item.quantity }}</td>
              <td class="py-2">{{ item.unit }}</td>
              <td class="py-2 text-right">{{ Number(item.unitPrice).toFixed(2) }}</td>
              <td v-if="hasDiscount" class="py-2 text-right">{{ Number(item.discountPercent) > 0 ? Number(item.discountPercent).toFixed(1) : '' }}</td>
              <td v-if="hasTax" class="py-2 text-right">{{ Number(item.taxRate) > 0 ? Number(item.taxRate).toFixed(1) : '' }}</td>
              <td class="py-2 text-right font-medium">{{ Number(item.total).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div class="bg-white px-8 py-4 flex justify-end">
        <div class="w-64 space-y-1 text-sm">
          <div class="flex justify-between"><span class="text-gray-500">Subtotal</span><span>RM {{ Number(doc.subtotal).toFixed(2) }}</span></div>
          <div v-if="Number(doc.taxAmount) > 0" class="flex justify-between"><span class="text-gray-500">Tax</span><span>RM {{ Number(doc.taxAmount).toFixed(2) }}</span></div>
          <div v-if="Number(doc.discountAmount) > 0" class="flex justify-between"><span class="text-gray-500">Discount</span><span class="text-red-600">-RM {{ Number(doc.discountAmount).toFixed(2) }}</span></div>
          <div class="flex justify-between py-2 border-t-2 border-gray-900 font-bold text-lg">
            <span>Total</span><span>RM {{ Number(doc.totalAmount).toFixed(2) }}</span>
          </div>
          <!-- Payment info -->
          <template v-if="doc.payments?.length">
            <div v-for="p in doc.payments" :key="p.id" class="flex justify-between text-green-700">
              <span>{{ fmtPaymentMethod(p.paymentMethod) }}</span>
              <span>-RM {{ Number(p.amount).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between pt-1 border-t border-gray-300 font-semibold">
              <span>Balance Due</span>
              <span>RM {{ Math.max(0, Number(doc.totalAmount) - Number(doc.paidAmount)).toFixed(2) }}</span>
            </div>
          </template>
        </div>
      </div>

      <!-- Notes & Terms -->
      <div v-if="doc.notes || doc.terms" class="bg-white px-8 py-4 border-t border-gray-200 grid grid-cols-2 gap-6 text-xs text-gray-500">
        <div v-if="doc.notes"><p class="font-semibold text-gray-700 mb-1">Notes</p><p class="whitespace-pre-line">{{ doc.notes }}</p></div>
        <div v-if="doc.terms"><p class="font-semibold text-gray-700 mb-1">Terms</p><p class="whitespace-pre-line">{{ doc.terms }}</p></div>
      </div>

      <!-- Footer -->
      <div class="bg-yellow-400 print:bg-transparent px-8 py-3 text-center border-t border-gray-200">
        <p class="text-gray-800 print:text-gray-500 text-sm font-medium print:font-normal">{{ doc.footerNote || 'Thank you for choosing Dream Garage!' }}</p>
      </div>
    </div>

    <!-- Payment History (below template) -->
    <div v-if="doc?.payments?.length" class="mt-6 max-w-3xl mx-auto print:hidden">
      <h3 class="text-sm font-semibold text-dark-200 uppercase tracking-wider mb-3">Payment History</h3>
      <div class="bg-dark-900 border border-dark-800 rounded-xl divide-y divide-dark-800">
        <div v-for="p in doc.payments" :key="p.id" class="px-4 py-3 flex items-center justify-between">
          <div>
            <span class="text-dark-200 text-sm">{{ fmtPaymentMethod(p.paymentMethod) }}</span>
            <span v-if="p.referenceNumber" class="text-dark-500 text-xs ml-2">#{{ p.referenceNumber }}</span>
            <span v-if="p.bankName" class="text-dark-500 text-xs ml-2">({{ p.bankName }})</span>
            <p v-if="p.notes" class="text-dark-500 text-xs mt-0.5">{{ p.notes }}</p>
          </div>
          <div class="text-right">
            <span class="text-green-400 font-medium">RM {{ Number(p.amount).toFixed(2) }}</span>
            <p class="text-dark-500 text-xs">{{ fmtDate(p.createdAt) }} by {{ p.createdBy?.name }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <BaseModal v-model="showPaymentModal" title="Record Payment" size="md">
      <div class="space-y-4">
        <BaseInput v-model="paymentForm.amount" label="Amount (RM)" type="number" step="0.01" min="0.01" required />
        <BaseSelect v-model="paymentForm.paymentMethod" label="Payment Method" required>
          <option value="CASH">Cash</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="CHEQUE">Cheque</option>
          <option value="CREDIT_CARD">Credit Card</option>
          <option value="EWALLET">E-Wallet</option>
          <option value="TNG">Touch 'n Go</option>
          <option value="BOOST">Boost</option>
        </BaseSelect>
        <BaseInput v-model="paymentForm.referenceNumber" label="Reference Number" placeholder="Optional" />
        <BaseInput v-model="paymentForm.bankName" label="Bank Name" placeholder="Optional" />
        <BaseInput v-model="paymentForm.notes" label="Notes" placeholder="Optional" />
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="showPaymentModal = false">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="paymentLoading" @click="handlePayment">Record Payment</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useDocumentStore } from '../../stores/documents'
import { useToast } from '../../composables/useToast'
import { domToPng } from 'modern-screenshot'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseBadge from '../../components/base/BaseBadge.vue'
import BaseModal from '../../components/base/BaseModal.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseSelect from '../../components/base/BaseSelect.vue'
import {
  ArrowLeft, Send, CreditCard, Download, Printer, Pencil,
  ArrowRightLeft, GitBranch,
} from 'lucide-vue-next'
import type { Document, DocumentType, DocumentStatus } from '../../types'

const route = useRoute()
const router = useRouter()
const store = useDocumentStore()
const toast = useToast()

const doc = ref<Document | null>(null)
const loadingDoc = ref(true)
const statusLoading = ref(false)
const converting = ref(false)
const exporting = ref(false)
const showPaymentModal = ref(false)
const paymentLoading = ref(false)

const paymentForm = reactive({
  amount: '',
  paymentMethod: 'CASH',
  referenceNumber: '',
  bankName: '',
  notes: '',
})

const hasDiscount = computed(() => doc.value?.items?.some((i) => Number(i.discountPercent) > 0))
const hasTax = computed(() => doc.value?.items?.some((i) => Number(i.taxRate) > 0))

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-MY')
}

function fmtPaymentMethod(method: string): string {
  const labels: Record<string, string> = {
    CASH: 'Cash',
    BANK_TRANSFER: 'Bank Transfer',
    CHEQUE: 'Cheque',
    CREDIT_CARD: 'Credit Card',
    EWALLET: 'E-Wallet',
    TNG: 'Touch \'n Go',
    BOOST: 'Boost',
  }
  return labels[method] || method
}

async function loadDocument() {
  loadingDoc.value = true
  try {
    doc.value = await store.getDocument(route.params.id as string)
  } catch {
    toast.error('Failed to load document')
    router.push('/app/documents')
  } finally {
    loadingDoc.value = false
  }
}

async function handleStatus(status: DocumentStatus) {
  if (!doc.value) return
  if (status === 'VOID' && !confirm('Are you sure you want to void this document? Stock will be restored.')) return
  statusLoading.value = true
  try {
    doc.value = await store.updateStatus(doc.value.id, status)
    // Re-fetch to get updated conversionTargets
    doc.value = await store.getDocument(doc.value.id)
    toast.success(`Status updated to ${status}`)
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to update status')
  } finally {
    statusLoading.value = false
  }
}

async function handleConvert(targetType: DocumentType) {
  if (!doc.value) return
  converting.value = true
  try {
    const newDoc = await store.convertDocument(doc.value.id, targetType)
    toast.success(`Converted to ${newDoc.documentNumber}`)
    router.push(`/app/documents/${newDoc.id}`)
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Conversion failed')
  } finally {
    converting.value = false
  }
}

async function handlePayment() {
  if (!doc.value || !paymentForm.amount) return
  paymentLoading.value = true
  try {
    doc.value = await store.addPayment(doc.value.id, {
      amount: parseFloat(paymentForm.amount),
      paymentMethod: paymentForm.paymentMethod as any,
      referenceNumber: paymentForm.referenceNumber || undefined,
      bankName: paymentForm.bankName || undefined,
      notes: paymentForm.notes || undefined,
    })
    // Re-fetch for conversionTargets
    doc.value = await store.getDocument(doc.value.id)
    toast.success('Payment recorded')
    showPaymentModal.value = false
    paymentForm.amount = ''
    paymentForm.referenceNumber = ''
    paymentForm.bankName = ''
    paymentForm.notes = ''
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to record payment')
  } finally {
    paymentLoading.value = false
  }
}

function handlePrint() {
  window.print()
}

async function exportAsImage() {
  exporting.value = true
  const el = document.getElementById('document-template')
  if (!el) {
    toast.error('Document template not found')
    exporting.value = false
    return
  }
  try {
    el.classList.remove('rounded-xl')
    // Force browser repaint before capture
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))

    const dataUrl = await domToPng(el, {
      scale: 2,
      width: el.offsetWidth,
      height: el.scrollHeight,
      style: {
        margin: '0',
        padding: '0',
        borderRadius: '0',
      },
    })

    el.classList.add('rounded-xl')

    const link = document.createElement('a')
    link.download = `${doc.value?.documentNumber || 'document'}.png`
    link.href = dataUrl
    link.click()
    toast.success('Document exported as PNG')
  } catch (err: any) {
    el.classList.add('rounded-xl')
    console.error('Export error:', err)
    toast.error('Export failed: ' + (err?.message || 'Unknown error'))
  } finally {
    exporting.value = false
  }
}

onMounted(() => loadDocument())
</script>

<style>
@media print {
  body * { visibility: hidden; }
  #document-template, #document-template * { visibility: visible; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  #document-template { position: absolute; left: 0; top: 0; width: 100%; max-width: 100%; }
}
</style>
