<template>
  <div class="max-w-4xl">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-dark-100">Take Order</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Customer & Vehicle -->
      <div class="bg-dark-900 border border-dark-800 rounded-xl p-6">
        <h3 class="text-sm font-semibold text-dark-200 uppercase tracking-wider mb-4">Customer & Vehicle</h3>
        <div class="space-y-4">
          <!-- Customer Search -->
          <div class="relative">
            <label class="block text-sm text-dark-300 mb-1">Search Customer</label>
            <input
              v-model="customerSearch"
              @input="debouncedSearch"
              type="text"
              placeholder="Search by phone, plate number, name, or vehicle model..."
              class="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
            />
            <!-- Search Results Dropdown -->
            <div v-if="searchResults.length && showResults" class="absolute z-20 w-full mt-1 bg-dark-800 border border-dark-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <button
                v-for="c in searchResults"
                :key="c.id"
                type="button"
                @click="selectCustomer(c)"
                class="w-full px-4 py-3 text-left hover:bg-dark-700 transition-colors border-b border-dark-700 last:border-0"
              >
                <div class="flex justify-between">
                  <span class="text-dark-100 text-sm font-medium">{{ c.name }}</span>
                  <span v-if="c.phone" class="text-dark-400 text-xs">{{ c.phone }}</span>
                </div>
                <div v-if="c.vehicles?.length" class="flex gap-2 mt-1">
                  <span v-for="v in c.vehicles" :key="v.id" class="text-gold-500 text-xs bg-gold-500/10 px-2 py-0.5 rounded">
                    {{ v.plate }} {{ v.model ? `(${v.model})` : '' }}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <BaseInput v-model="form.customerPhone" label="Phone" placeholder="e.g. 012-3456789" />
            <BaseInput v-model="form.customerName" label="Name (optional)" placeholder="Walk-in customer" />
            <BaseSelect v-model="form.foremanId" label="Foreman / Salesperson" placeholder="Select worker">
              <option v-for="w in workers" :key="w.id" :value="w.id">{{ w.name }} ({{ w.role }})</option>
            </BaseSelect>
          </div>

          <h3 class="text-sm font-semibold text-dark-200 uppercase tracking-wider mt-6 mb-3">Vehicle Info</h3>
          <div class="grid grid-cols-3 gap-4">
            <BaseInput v-model="form.vehiclePlate" label="Plate Number" placeholder="e.g. JQR 1234" />
            <BaseInput v-model="form.vehicleMake" label="Make" placeholder="e.g. Honda, BMW" />
            <BaseInput v-model="form.vehicleModel" label="Model" placeholder="e.g. Accord T2A, 320i" />
          </div>
          <div class="grid grid-cols-3 gap-4">
            <BaseInput v-model="form.vehicleColor" label="Color" placeholder="e.g. White, Black" />
            <BaseInput v-model="form.vehicleMileage" label="Current Mileage (KM)" placeholder="e.g. 112692" />
            <BaseInput v-model="form.vehicleEngineNo" label="Engine No (optional)" placeholder="e.g. R20A3-123456" />
          </div>
        </div>
      </div>

      <!-- Items -->
      <div class="bg-dark-900 border border-dark-800 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-dark-200 uppercase tracking-wider">Items</h3>
          <BaseButton variant="secondary" size="sm" type="button" @click="addItem">
            <Plus class="w-4 h-4 mr-1" /> Add Item
          </BaseButton>
        </div>

        <div class="space-y-3">
          <div v-for="(item, idx) in form.items" :key="idx" class="flex items-start gap-3 bg-dark-800/50 rounded-lg p-3">
            <div class="flex-1 grid grid-cols-12 gap-2">
              <!-- Stock Search -->
              <div class="col-span-5 relative">
                <input
                  v-model="item.searchTerm"
                  @input="(e) => searchStock(idx, (e.target as HTMLInputElement).value)"
                  @focus="item.showDropdown = true"
                  type="text"
                  placeholder="Search stock item..."
                  class="w-full bg-dark-800 border border-dark-700 rounded px-2 py-1.5 text-dark-100 text-sm placeholder-dark-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
                />
                <div v-if="item.showDropdown && item.stockResults.length" class="absolute z-10 w-full mt-1 bg-dark-800 border border-dark-700 rounded shadow-lg max-h-40 overflow-y-auto">
                  <button
                    v-for="s in item.stockResults"
                    :key="s.id"
                    type="button"
                    @click="selectStock(idx, s)"
                    class="w-full px-3 py-2 text-left hover:bg-dark-700 text-sm transition-colors"
                  >
                    <span class="text-gold-500 font-mono text-xs">{{ s.itemCode }}</span>
                    <span class="text-dark-200 ml-2">{{ s.description }}</span>
                    <span class="text-dark-500 ml-2">RM{{ Number(s.sellPrice).toFixed(2) }}</span>
                  </button>
                </div>
              </div>
              <div class="col-span-2">
                <input v-model="item.description" placeholder="Description" class="w-full bg-dark-800 border border-dark-700 rounded px-2 py-1.5 text-dark-100 text-sm placeholder-dark-500 focus:outline-none" />
              </div>
              <div class="col-span-1">
                <input v-model.number="item.quantity" type="number" min="1" placeholder="Qty" class="w-full bg-dark-800 border border-dark-700 rounded px-2 py-1.5 text-dark-100 text-sm text-center focus:outline-none" />
              </div>
              <div class="col-span-2">
                <input v-model.number="item.unitPrice" type="number" step="0.01" min="0" placeholder="Price" class="w-full bg-dark-800 border border-dark-700 rounded px-2 py-1.5 text-dark-100 text-sm text-right focus:outline-none" />
              </div>
              <div class="col-span-1 text-right text-dark-300 text-sm py-1.5">
                RM {{ ((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2) }}
              </div>
              <div class="col-span-1 flex justify-end">
                <button type="button" @click="removeItem(idx)" class="p-1.5 text-dark-400 hover:text-red-400 transition-colors">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Total -->
        <div class="flex justify-end mt-4 pt-4 border-t border-dark-800">
          <div class="text-right">
            <span class="text-dark-400 text-sm mr-4">Total:</span>
            <span class="text-dark-100 text-lg font-semibold">RM {{ orderTotal.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="bg-dark-900 border border-dark-800 rounded-xl p-6">
        <label class="block text-sm text-dark-300 mb-1">Notes (optional)</label>
        <textarea
          v-model="form.notes"
          rows="2"
          placeholder="Any special instructions..."
          class="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 resize-none"
        ></textarea>
      </div>

      <!-- Submit -->
      <div class="flex justify-end gap-3">
        <BaseButton variant="secondary" type="button" @click="$router.push('/app/dashboard')">Cancel</BaseButton>
        <BaseButton variant="primary" type="submit" :loading="saving" :disabled="form.items.length === 0">
          Create Draft Invoice
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentStore } from '../../stores/documents'
import { useStockStore } from '../../stores/stock'
import { useToast } from '../../composables/useToast'
import api from '../../lib/api'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseSelect from '../../components/base/BaseSelect.vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import type { Customer, StockItem } from '../../types'

const router = useRouter()
const docStore = useDocumentStore()
const stockStore = useStockStore()
const toast = useToast()
const saving = ref(false)

const workers = ref<{ id: string; name: string; role: string }[]>([])
const customerSearch = ref('')
const searchResults = ref<Customer[]>([])
const showResults = ref(false)

interface OrderItem {
  stockItemId?: string
  itemCode?: string
  searchTerm: string
  description: string
  quantity: number
  unitPrice: number
  unit: string
  showDropdown: boolean
  stockResults: StockItem[]
}

const form = reactive({
  customerName: '',
  customerPhone: '',
  vehiclePlate: '',
  vehicleMake: '',
  vehicleModel: '',
  vehicleColor: '',
  vehicleMileage: '',
  vehicleEngineNo: '',
  foremanId: '',
  notes: '',
  items: [] as OrderItem[],
})

const orderTotal = computed(() =>
  form.items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0)
)

function addItem() {
  form.items.push({
    searchTerm: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    unit: 'PCS',
    showDropdown: false,
    stockResults: [],
  })
}

function removeItem(idx: number) {
  form.items.splice(idx, 1)
}

// Customer search
let customerTimer: ReturnType<typeof setTimeout>
function debouncedSearch() {
  clearTimeout(customerTimer)
  customerTimer = setTimeout(async () => {
    if (customerSearch.value.length < 1) {
      searchResults.value = []
      return
    }
    try {
      const { data } = await api.get('/customers/search', { params: { q: customerSearch.value } })
      searchResults.value = data.data
      showResults.value = true
    } catch { /* ignore */ }
  }, 300)
}

function selectCustomer(c: Customer) {
  form.customerName = c.name
  form.customerPhone = c.phone || ''
  if (c.vehicles?.length) {
    const defaultV = c.vehicles.find((v) => v.isDefault) || c.vehicles[0]
    form.vehiclePlate = defaultV.plate
    form.vehicleModel = defaultV.model || ''
    form.vehicleMileage = defaultV.mileage || ''
  }
  showResults.value = false
  customerSearch.value = ''
}

// Stock item search per line
let stockTimers: Record<number, ReturnType<typeof setTimeout>> = {}
function searchStock(idx: number, term: string) {
  clearTimeout(stockTimers[idx])
  form.items[idx].searchTerm = term
  if (term.length < 1) {
    form.items[idx].stockResults = []
    return
  }
  stockTimers[idx] = setTimeout(async () => {
    try {
      const { data } = await api.get('/stock', { params: { search: term, limit: 8 } })
      form.items[idx].stockResults = data.data
      form.items[idx].showDropdown = true
    } catch { /* ignore */ }
  }, 200)
}

function selectStock(idx: number, s: StockItem) {
  form.items[idx].stockItemId = s.id
  form.items[idx].itemCode = s.itemCode
  form.items[idx].description = s.description
  form.items[idx].unitPrice = Number(s.sellPrice)
  form.items[idx].unit = s.uom
  form.items[idx].searchTerm = `${s.itemCode} - ${s.description}`
  form.items[idx].showDropdown = false
  form.items[idx].stockResults = []
}

async function handleSubmit() {
  if (form.items.length === 0) return
  saving.value = true
  try {
    const vehicleModelFull = [form.vehicleMake, form.vehicleModel].filter(Boolean).join(' ') || undefined
    const doc = await docStore.createDocument({
      documentType: 'INVOICE',
      customerName: form.customerName || undefined,
      customerPhone: form.customerPhone || undefined,
      vehiclePlate: form.vehiclePlate || undefined,
      vehicleModel: vehicleModelFull,
      vehicleMileage: form.vehicleMileage || undefined,
      vehicleColor: form.vehicleColor || undefined,
      vehicleEngineNo: form.vehicleEngineNo || undefined,
      foremanId: form.foremanId || undefined,
      notes: form.notes || undefined,
      items: form.items.map((item, idx) => ({
        stockItemId: item.stockItemId,
        itemCode: item.itemCode,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unit: item.unit,
        sortOrder: idx,
      })),
    })
    toast.success(`Draft invoice ${doc.documentNumber} created`)
    router.push(`/app/documents/${doc.id}`)
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to create order')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  addItem() // Start with one empty item
  try {
    const { data } = await api.get('/workers')
    workers.value = data.data
  } catch { /* ignore */ }
})

// Close dropdowns on outside click
document.addEventListener('click', () => {
  showResults.value = false
  form.items.forEach((item) => { item.showDropdown = false })
})
</script>
