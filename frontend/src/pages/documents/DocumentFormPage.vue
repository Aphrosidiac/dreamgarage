<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <button @click="$router.back()" class="text-dark-400 hover:text-dark-200 transition-colors">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h2 class="text-lg font-semibold text-dark-100">
        {{ isEdit ? `Edit ${store.getDocTypeLabel(form.documentType)}` : `New ${store.getDocTypeLabel(form.documentType)}` }}
      </h2>
    </div>

    <div v-if="pageLoading" class="text-dark-400">Loading...</div>

    <form v-else @submit.prevent="handleSubmit" class="grid lg:grid-cols-3 gap-6">
      <!-- Main Form (2/3) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Customer & Vehicle Info -->
        <div class="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <h3 class="text-sm font-semibold text-dark-200 uppercase tracking-wider mb-4">Customer & Vehicle</h3>

          <!-- Customer Search -->
          <div class="relative mb-4">
            <Users class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              v-model="customerSearch"
              @input="handleCustomerSearch"
              @focus="showCustomerResults = true"
              type="text"
              placeholder="Search customer by name or phone..."
              class="w-full bg-dark-800 border border-dark-700 rounded-lg pl-10 pr-3 py-2.5 text-dark-100 text-sm placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
            />
            <div
              v-if="showCustomerResults && customerResults.length"
              class="absolute z-20 mt-1 w-full bg-dark-800 border border-dark-700 rounded-lg shadow-xl max-h-48 overflow-y-auto"
            >
              <button
                v-for="c in customerResults"
                :key="c.id"
                type="button"
                @click="selectCustomer(c)"
                class="w-full text-left px-4 py-2.5 hover:bg-dark-700 transition-colors"
              >
                <span class="text-dark-100 text-sm font-medium">{{ c.name }}</span>
                <span v-if="c.phone" class="text-dark-500 text-sm ml-2">{{ c.phone }}</span>
                <span v-if="c.vehicles?.length" class="text-dark-600 text-xs ml-2">({{ c.vehicles.length }} vehicle{{ c.vehicles.length > 1 ? 's' : '' }})</span>
              </button>
            </div>
          </div>

          <!-- Vehicle Switcher (if selected customer has multiple vehicles) -->
          <div v-if="selectedCustomerVehicles.length > 1" class="mb-4">
            <label class="block text-sm font-medium text-dark-200 mb-1.5">Vehicle</label>
            <select
              v-model="selectedVehicleId"
              @change="applyVehicle"
              class="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2.5 text-dark-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
            >
              <option v-for="v in selectedCustomerVehicles" :key="v.id" :value="v.id">
                {{ v.plate }}{{ v.model ? ` — ${v.model}` : '' }}{{ v.isDefault ? ' (Default)' : '' }}
              </option>
            </select>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <BaseInput v-model="form.customerName" label="Customer Name" placeholder="e.g. Ahmad bin Ali" />
            <BaseInput v-model="form.customerPhone" label="Phone" placeholder="+60 12-345 6789" />
            <BaseInput v-model="form.vehiclePlate" label="Vehicle Plate" placeholder="e.g. JUX 1589" />
            <BaseInput v-model="form.vehicleModel" label="Make & Model" placeholder="e.g. Proton X50" />
            <BaseInput v-model="form.vehicleMileage" label="Mileage (KM)" placeholder="e.g. 57,028" />
            <BaseInput v-model="form.customerEmail" label="Email" type="email" placeholder="customer@email.com" />
          </div>
        </div>

        <!-- Line Items -->
        <div class="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-dark-200 uppercase tracking-wider">Items</h3>
            <div class="flex gap-2">
              <button type="button" @click="addCustomItem" class="text-xs text-dark-400 hover:text-gold-500 transition-colors flex items-center gap-1">
                <Plus class="w-3.5 h-3.5" /> Custom Item
              </button>
            </div>
          </div>

          <!-- Stock Search -->
          <div class="relative mb-4">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              v-model="stockSearch"
              @input="handleStockSearch"
              @focus="showStockResults = true"
              type="text"
              placeholder="Search stock by item code or description..."
              class="w-full bg-dark-800 border border-dark-700 rounded-lg pl-10 pr-3 py-2.5 text-dark-100 text-sm placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
            />
            <div
              v-if="showStockResults && stockResults.length"
              class="absolute z-10 mt-1 w-full bg-dark-800 border border-dark-700 rounded-lg shadow-xl max-h-48 overflow-y-auto"
            >
              <button
                v-for="item in stockResults"
                :key="item.id"
                type="button"
                @click="addStockItem(item)"
                class="w-full text-left px-4 py-2.5 hover:bg-dark-700 transition-colors flex items-center justify-between"
              >
                <div>
                  <span class="text-gold-500 font-mono text-sm">{{ item.itemCode }}</span>
                  <span class="text-dark-200 text-sm ml-2">{{ item.description }}</span>
                </div>
                <div class="text-right">
                  <span class="text-dark-300 text-sm">RM {{ Number(item.sellPrice).toFixed(2) }}</span>
                  <span class="text-dark-500 text-xs ml-2">({{ item.quantity }} in stock)</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Items Table -->
          <div class="overflow-x-auto border border-dark-800 rounded-lg">
            <table class="w-full text-sm">
              <thead class="bg-dark-800/50 text-dark-400 text-xs uppercase border-b border-dark-800">
                <tr>
                  <th class="px-3 py-2.5 text-left w-8">#</th>
                  <th class="px-3 py-2.5 text-left">Description</th>
                  <th class="px-3 py-2.5 text-center w-16">Qty</th>
                  <th class="px-3 py-2.5 text-left w-16">Unit</th>
                  <th class="px-3 py-2.5 text-right w-24">Price</th>
                  <th class="px-3 py-2.5 text-right w-16">Disc%</th>
                  <th class="px-3 py-2.5 text-right w-16">Tax%</th>
                  <th class="px-3 py-2.5 text-right w-24">Amount</th>
                  <th class="px-3 py-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-dark-800">
                <tr v-if="!form.items.length">
                  <td colspan="9" class="px-3 py-8 text-center text-dark-500">Add items using the search above or "Custom Item" button</td>
                </tr>
                <tr v-for="(item, idx) in form.items" :key="idx" class="hover:bg-dark-800/20">
                  <td class="px-3 py-2 text-dark-500">{{ idx + 1 }}</td>
                  <td class="px-3 py-2">
                    <div class="flex flex-col gap-1">
                      <span v-if="item.itemCode" class="text-gold-500 font-mono text-xs">{{ item.itemCode }}</span>
                      <input
                        v-model="item.description"
                        class="bg-transparent border-0 text-dark-200 text-sm p-0 focus:outline-none focus:ring-0 w-full"
                        placeholder="Item description"
                      />
                    </div>
                  </td>
                  <td class="px-3 py-2">
                    <input v-model.number="item.quantity" type="number" min="1" class="w-16 bg-dark-800 border border-dark-700 rounded px-2 py-1 text-dark-100 text-sm text-center focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
                  </td>
                  <td class="px-3 py-2">
                    <input v-model="item.unit" class="w-14 bg-dark-800 border border-dark-700 rounded px-2 py-1 text-dark-100 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
                  </td>
                  <td class="px-3 py-2">
                    <input v-model.number="item.unitPrice" type="number" step="0.01" min="0" class="w-24 bg-dark-800 border border-dark-700 rounded px-2 py-1 text-dark-100 text-sm text-right focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
                  </td>
                  <td class="px-3 py-2">
                    <input v-model.number="item.discountPercent" type="number" step="0.1" min="0" max="100" class="w-16 bg-dark-800 border border-dark-700 rounded px-2 py-1 text-dark-100 text-sm text-right focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
                  </td>
                  <td class="px-3 py-2">
                    <input v-model.number="item.taxRate" type="number" step="0.1" min="0" max="100" class="w-16 bg-dark-800 border border-dark-700 rounded px-2 py-1 text-dark-100 text-sm text-right focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
                  </td>
                  <td class="px-3 py-2 text-right font-medium text-dark-100">{{ calcItemTotal(item).toFixed(2) }}</td>
                  <td class="px-3 py-2">
                    <button type="button" @click="form.items.splice(idx, 1)" class="text-dark-400 hover:text-red-400 transition-colors">
                      <X class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Notes & Terms -->
        <div class="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-dark-200 mb-1.5">Notes</label>
              <textarea v-model="form.notes" rows="3" class="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2.5 text-dark-100 text-sm placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 resize-none" placeholder="Notes for the customer..." />
            </div>
            <div>
              <label class="block text-sm font-medium text-dark-200 mb-1.5">Terms & Conditions</label>
              <textarea v-model="form.terms" rows="3" class="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2.5 text-dark-100 text-sm placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 resize-none" placeholder="Payment terms..." />
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar (1/3) -->
      <div class="space-y-6">
        <!-- Dates -->
        <div class="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-4">
          <h3 class="text-sm font-semibold text-dark-200 uppercase tracking-wider">Details</h3>
          <BaseInput v-model="form.issueDate" label="Issue Date" type="date" required />
          <BaseInput v-model="form.dueDate" label="Due Date" type="date" />
        </div>

        <!-- Totals -->
        <div class="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <h3 class="text-sm font-semibold text-dark-200 uppercase tracking-wider mb-4">Summary</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-dark-400">Subtotal</span>
              <span class="text-dark-200">RM {{ calcSubtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-dark-400">Tax</span>
              <span class="text-dark-200">RM {{ calcTax.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-dark-400">Discount</span>
              <input v-model.number="form.discountAmount" type="number" step="0.01" min="0" class="w-24 bg-dark-800 border border-dark-700 rounded px-2 py-1 text-dark-100 text-sm text-right focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
            </div>
            <div class="flex justify-between pt-2 border-t border-dark-800">
              <span class="text-dark-100 font-semibold">Total</span>
              <span class="text-gold-500 font-bold text-lg">RM {{ calcTotal.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-2">
          <BaseButton variant="primary" type="submit" :loading="saving" :disabled="!form.items.length">
            {{ isEdit ? 'Update' : 'Create' }} {{ store.getDocTypeLabel(form.documentType) }}
          </BaseButton>
          <BaseButton variant="secondary" type="button" @click="$router.back()">Cancel</BaseButton>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocumentStore } from '../../stores/documents'
import { useToast } from '../../composables/useToast'
import api from '../../lib/api'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import { ArrowLeft, Search, Plus, X, Users } from 'lucide-vue-next'
import { useCustomerStore } from '../../stores/customers'
import type { StockItem, DocumentType, Customer, Vehicle } from '../../types'

interface FormItem {
  stockItemId?: string
  itemCode?: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  discountPercent: number
  taxRate: number
}

const route = useRoute()
const router = useRouter()
const store = useDocumentStore()
const customerStore = useCustomerStore()
const toast = useToast()

const isEdit = computed(() => !!route.params.id)
const pageLoading = ref(false)
const saving = ref(false)
const stockSearch = ref('')
const stockResults = ref<StockItem[]>([])
const showStockResults = ref(false)

// Customer search
const customerSearch = ref('')
const customerResults = ref<Customer[]>([])
const showCustomerResults = ref(false)
const selectedCustomerVehicles = ref<Vehicle[]>([])
const selectedVehicleId = ref('')

let customerSearchTimer: ReturnType<typeof setTimeout>
function handleCustomerSearch() {
  clearTimeout(customerSearchTimer)
  if (!customerSearch.value) { customerResults.value = []; return }
  customerSearchTimer = setTimeout(async () => {
    try {
      customerResults.value = await customerStore.searchCustomers(customerSearch.value)
      showCustomerResults.value = true
    } catch { customerResults.value = [] }
  }, 200)
}

function selectCustomer(c: Customer) {
  form.customerName = c.name
  form.customerPhone = c.phone || ''
  selectedCustomerVehicles.value = c.vehicles || []
  customerSearch.value = ''
  customerResults.value = []
  showCustomerResults.value = false

  // Auto-select default vehicle
  const defaultVehicle = c.vehicles?.find((v) => v.isDefault) || c.vehicles?.[0]
  if (defaultVehicle) {
    selectedVehicleId.value = defaultVehicle.id
    form.vehiclePlate = defaultVehicle.plate
    form.vehicleModel = defaultVehicle.model || ''
    form.vehicleMileage = defaultVehicle.mileage || ''
  }
}

function applyVehicle() {
  const v = selectedCustomerVehicles.value.find((v) => v.id === selectedVehicleId.value)
  if (v) {
    form.vehiclePlate = v.plate
    form.vehicleModel = v.model || ''
    form.vehicleMileage = v.mileage || ''
  }
}

const form = reactive({
  documentType: (route.query.type as DocumentType) || 'INVOICE',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  vehiclePlate: '',
  vehicleModel: '',
  vehicleMileage: '',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  notes: '',
  terms: '',
  footerNote: '',
  discountAmount: 0,
  items: [] as FormItem[],
})

// Item calculations
function calcItemTotal(item: FormItem): number {
  const sub = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100)
  const tax = sub * ((item.taxRate || 0) / 100)
  return Math.round((sub + tax) * 100) / 100
}

const calcSubtotal = computed(() =>
  form.items.reduce((sum, i) => sum + i.quantity * i.unitPrice * (1 - (i.discountPercent || 0) / 100), 0)
)
const calcTax = computed(() =>
  form.items.reduce((sum, i) => {
    const sub = i.quantity * i.unitPrice * (1 - (i.discountPercent || 0) / 100)
    return sum + sub * ((i.taxRate || 0) / 100)
  }, 0)
)
const calcTotal = computed(() => Math.round((calcSubtotal.value + calcTax.value - (form.discountAmount || 0)) * 100) / 100)

// Stock search
let searchTimer: ReturnType<typeof setTimeout>
function handleStockSearch() {
  clearTimeout(searchTimer)
  if (!stockSearch.value) { stockResults.value = []; return }
  searchTimer = setTimeout(async () => {
    try {
      const { data } = await api.get('/stock', { params: { search: stockSearch.value, limit: 10 } })
      stockResults.value = data.data
      showStockResults.value = true
    } catch { stockResults.value = [] }
  }, 200)
}

function addStockItem(stock: StockItem) {
  form.items.push({
    stockItemId: stock.id,
    itemCode: stock.itemCode,
    description: stock.description,
    quantity: 1,
    unit: stock.uom,
    unitPrice: Number(stock.sellPrice),
    discountPercent: 0,
    taxRate: 0,
  })
  stockSearch.value = ''
  stockResults.value = []
  showStockResults.value = false
}

function addCustomItem() {
  form.items.push({
    description: '',
    quantity: 1,
    unit: 'PCS',
    unitPrice: 0,
    discountPercent: 0,
    taxRate: 0,
  })
}

// Load existing document for edit
async function loadDocument() {
  if (!route.params.id) return
  pageLoading.value = true
  try {
    const doc = await store.getDocument(route.params.id as string)
    form.documentType = doc.documentType
    form.customerName = doc.customerName || ''
    form.customerPhone = doc.customerPhone || ''
    form.customerEmail = doc.customerEmail || ''
    form.vehiclePlate = doc.vehiclePlate || ''
    form.vehicleModel = doc.vehicleModel || ''
    form.vehicleMileage = doc.vehicleMileage || ''
    form.issueDate = doc.issueDate.split('T')[0]
    form.dueDate = doc.dueDate?.split('T')[0] || ''
    form.notes = doc.notes || ''
    form.terms = doc.terms || ''
    form.footerNote = doc.footerNote || ''
    form.discountAmount = Number(doc.discountAmount)
    form.items = (doc.items || []).map((i) => ({
      stockItemId: i.stockItemId || undefined,
      itemCode: i.itemCode || undefined,
      description: i.description,
      quantity: i.quantity,
      unit: i.unit,
      unitPrice: Number(i.unitPrice),
      discountPercent: Number(i.discountPercent),
      taxRate: Number(i.taxRate),
    }))
  } catch {
    toast.error('Failed to load document')
    router.push('/app/documents')
  } finally {
    pageLoading.value = false
  }
}

async function handleSubmit() {
  if (!form.items.length) return
  saving.value = true
  try {
    const payload = { ...form, items: form.items.map((i, idx) => ({ ...i, sortOrder: idx })) }
    if (isEdit.value) {
      await store.updateDocument(route.params.id as string, payload)
      toast.success('Document updated')
    } else {
      const doc = await store.createDocument(payload)
      toast.success(`${doc.documentNumber} created`)
      router.push(`/app/documents/${doc.id}`)
      return
    }
    router.push('/app/documents')
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to save document')
  } finally {
    saving.value = false
  }
}

// Close dropdown on click outside
function closeDropdown() { showStockResults.value = false; showCustomerResults.value = false }
onMounted(() => {
  document.addEventListener('click', closeDropdown)
  loadDocument()
})
onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
  clearTimeout(searchTimer)
  clearTimeout(customerSearchTimer)
})
</script>
