<template>
  <div class="max-w-2xl">
    <div class="flex items-center gap-3 mb-6">
      <button @click="$router.back()" class="text-dark-400 hover:text-dark-200 transition-colors">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h2 class="text-lg font-semibold text-dark-100">Edit Stock Item</h2>
    </div>

    <div v-if="loadingItem" class="text-dark-400">Loading...</div>

    <form v-else @submit.prevent="handleSubmit" class="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="form.itemCode" label="Item Code" required />
        <BaseSelect v-model="form.categoryId" label="Category" placeholder="Select category">
          <option v-for="cat in stock.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </BaseSelect>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <BaseSelect v-model="form.brandId" label="Brand" placeholder="Select brand">
          <option v-for="b in filteredBrands" :key="b.id" :value="b.id">{{ b.name }}</option>
        </BaseSelect>
        <BaseSelect v-model="form.countryOfOrigin" label="Country of Origin" placeholder="Select country">
          <option v-for="c in countries" :key="c.code" :value="c.code">{{ c.flag }} {{ c.name }}</option>
        </BaseSelect>
      </div>

      <BaseInput v-model="form.description" label="Description" required />

      <div class="grid grid-cols-3 gap-4">
        <BaseSelect v-model="form.uom" label="UOM">
          <option v-for="u in uomOptions" :key="u" :value="u">{{ u }}</option>
        </BaseSelect>
        <BaseInput v-model="form.costPrice" label="Cost Price (RM)" type="number" step="0.01" min="0" required />
        <BaseInput v-model="form.sellPrice" label="Sell Price (RM)" type="number" step="0.01" min="0" required />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="form.quantity" label="Quantity" type="number" min="0" :disabled="form.isTyre && dotBatches.length > 0" />
        <BaseInput v-model="form.minStock" label="Min Stock Alert" type="number" min="0" />
      </div>

      <div class="flex items-center gap-4 pt-2">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="form.isTyre" class="accent-gold-500" />
          <span class="text-dark-300 text-sm">This is a tyre item</span>
        </label>
        <BaseInput v-if="form.isTyre" v-model="form.tyreSize" label="Tyre Size" placeholder="e.g. 185/65R15" class="flex-1 max-w-xs" />
      </div>

      <!-- DOT Batch Management (tyre items only) -->
      <div v-if="form.isTyre" class="border border-dark-700 rounded-lg p-4 mt-2">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-semibold text-dark-200 uppercase tracking-wider">DOT Batches</h4>
          <span class="text-dark-500 text-xs">Total: {{ dotBatchTotal }} pcs</span>
        </div>

        <div v-if="dotBatches.length" class="space-y-2 mb-3">
          <div v-for="dot in dotBatches" :key="dot.id" class="flex items-center gap-3 bg-dark-800/50 rounded-lg px-3 py-2">
            <span class="text-dark-400 text-xs">DOT</span>
            <span class="text-dark-100 font-mono text-sm font-medium">{{ dot.dotCode }}</span>
            <span class="text-gold-500 text-sm">{{ dot.quantity }} pcs</span>
            <div class="flex items-center gap-1 ml-auto">
              <button type="button" @click="adjustDot(dot, 'add')" class="px-2 py-1 text-xs bg-dark-700 hover:bg-dark-600 text-green-400 rounded transition-colors">+ Add</button>
              <button type="button" @click="adjustDot(dot, 'remove')" class="px-2 py-1 text-xs bg-dark-700 hover:bg-dark-600 text-red-400 rounded transition-colors">- Remove</button>
            </div>
          </div>
        </div>

        <div v-else class="text-dark-500 text-sm mb-3">No DOT batches yet.</div>

        <!-- Add new DOT batch -->
        <div class="flex items-end gap-3">
          <BaseInput v-model="newDot.code" label="DOT Code" placeholder="e.g. 1206" class="flex-1" />
          <BaseInput v-model="newDot.quantity" label="Qty" type="number" min="1" class="w-24" />
          <BaseButton variant="secondary" size="sm" type="button" :loading="addingDot" @click="addDotBatch" class="mb-0.5">
            <Plus class="w-4 h-4 mr-1" /> Add
          </BaseButton>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <BaseButton variant="secondary" type="button" @click="$router.back()">Cancel</BaseButton>
        <BaseButton variant="primary" type="submit" :loading="saving">Update Item</BaseButton>
      </div>
    </form>

    <!-- Adjust DOT Modal -->
    <BaseModal v-model="showAdjustModal" :title="adjustType === 'add' ? 'Add to DOT Batch' : 'Remove from DOT Batch'" size="sm">
      <p class="text-dark-300 text-sm mb-3">
        DOT <strong class="text-dark-100 font-mono">{{ adjustTarget?.dotCode }}</strong> — current stock: <strong class="text-gold-500">{{ adjustTarget?.quantity }} pcs</strong>
      </p>
      <BaseInput v-model="adjustQty" label="Quantity" type="number" min="1" />
      <BaseInput v-model="adjustReason" label="Reason" placeholder="e.g. New stock arrival, sold, damaged" />
      <template #footer>
        <BaseButton variant="secondary" @click="showAdjustModal = false">Cancel</BaseButton>
        <BaseButton :variant="adjustType === 'add' ? 'primary' : 'primary'" :loading="adjusting" @click="confirmAdjust">
          {{ adjustType === 'add' ? 'Add Stock' : 'Remove Stock' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStockStore } from '../../stores/stock'
import { useToast } from '../../composables/useToast'
import api from '../../lib/api'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseSelect from '../../components/base/BaseSelect.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseModal from '../../components/base/BaseModal.vue'
import { ArrowLeft, Plus } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const stock = useStockStore()
const toast = useToast()
const saving = ref(false)
const loadingItem = ref(true)

const uomOptions = ['PCS', 'SET', 'LITRE', 'BOX', 'UNIT', 'PAIR', 'KG']

const countries = [
  { code: 'MY', name: 'Malaysia', flag: '\u{1F1F2}\u{1F1FE}' },
  { code: 'JP', name: 'Japan', flag: '\u{1F1EF}\u{1F1F5}' },
  { code: 'CN', name: 'China', flag: '\u{1F1E8}\u{1F1F3}' },
  { code: 'KR', name: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}' },
  { code: 'TH', name: 'Thailand', flag: '\u{1F1F9}\u{1F1ED}' },
  { code: 'ID', name: 'Indonesia', flag: '\u{1F1EE}\u{1F1E9}' },
  { code: 'DE', name: 'Germany', flag: '\u{1F1E9}\u{1F1EA}' },
  { code: 'US', name: 'United States', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'FR', name: 'France', flag: '\u{1F1EB}\u{1F1F7}' },
  { code: 'IT', name: 'Italy', flag: '\u{1F1EE}\u{1F1F9}' },
  { code: 'GB', name: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: 'TW', name: 'Taiwan', flag: '\u{1F1F9}\u{1F1FC}' },
  { code: 'IN', name: 'India', flag: '\u{1F1EE}\u{1F1F3}' },
  { code: 'AU', name: 'Australia', flag: '\u{1F1E6}\u{1F1FA}' },
  { code: 'SG', name: 'Singapore', flag: '\u{1F1F8}\u{1F1EC}' },
]

const form = reactive({
  itemCode: '',
  description: '',
  uom: 'PCS',
  costPrice: '',
  sellPrice: '',
  quantity: '0',
  minStock: '5',
  categoryId: '',
  brandId: '',
  countryOfOrigin: '',
  isTyre: false,
  tyreSize: '',
})

// ─── DOT Batch Management ─────────────────────────
interface DotBatch { id: string; dotCode: string; quantity: number }
const dotBatches = ref<DotBatch[]>([])
const dotBatchTotal = computed(() => dotBatches.value.reduce((s, d) => s + d.quantity, 0))
const newDot = reactive({ code: '', quantity: '1' })
const addingDot = ref(false)

const showAdjustModal = ref(false)
const adjustTarget = ref<DotBatch | null>(null)
const adjustType = ref<'add' | 'remove'>('add')
const adjustQty = ref('1')
const adjustReason = ref('')
const adjusting = ref(false)

async function fetchDots() {
  const id = route.params.id as string
  try {
    const { data } = await api.get(`/stock/${id}/dots`)
    dotBatches.value = data.data
  } catch { /* ignore */ }
}

async function addDotBatch() {
  if (!newDot.code || !newDot.quantity) return
  addingDot.value = true
  try {
    await api.post(`/stock/${route.params.id}/dots`, {
      dotCode: newDot.code.replace(/\//g, ''),
      quantity: parseInt(newDot.quantity),
    })
    newDot.code = ''
    newDot.quantity = '1'
    await fetchDots()
    form.quantity = String(dotBatchTotal.value)
    toast.success('DOT batch added')
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to add DOT batch')
  } finally {
    addingDot.value = false
  }
}

function adjustDot(dot: DotBatch, type: 'add' | 'remove') {
  adjustTarget.value = dot
  adjustType.value = type
  adjustQty.value = '1'
  adjustReason.value = ''
  showAdjustModal.value = true
}

async function confirmAdjust() {
  if (!adjustTarget.value || !adjustQty.value || !adjustReason.value.trim()) {
    toast.error('Quantity and reason are required')
    return
  }
  adjusting.value = true
  try {
    await api.patch(`/stock/${route.params.id}/dots/${adjustTarget.value.id}`, {
      type: adjustType.value,
      quantity: parseInt(adjustQty.value),
      reason: adjustReason.value.trim(),
    })
    showAdjustModal.value = false
    await fetchDots()
    form.quantity = String(dotBatchTotal.value)
    toast.success(`DOT ${adjustTarget.value.dotCode} updated`)
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to adjust DOT batch')
  } finally {
    adjusting.value = false
  }
}

async function loadItem() {
  loadingItem.value = true
  try {
    const item = await stock.getItem(route.params.id as string)
    form.itemCode = item.itemCode
    form.description = item.description
    form.uom = item.uom
    form.costPrice = String(item.costPrice)
    form.sellPrice = String(item.sellPrice)
    form.quantity = String(item.quantity)
    form.minStock = String(item.minStock)
    form.categoryId = item.categoryId || ''
    form.brandId = item.brandId || ''
    form.countryOfOrigin = item.countryOfOrigin || ''
    form.isTyre = item.isTyre || false
    form.tyreSize = item.tyreSize || ''
    if (item.isTyre) fetchDots()
    if (item.categoryId) stock.fetchBrands(item.categoryId)
  } catch {
    toast.error('Failed to load item')
    router.push('/app/stock')
  } finally {
    loadingItem.value = false
  }
}

async function handleSubmit() {
  saving.value = true
  try {
    await stock.updateItem(route.params.id as string, {
      itemCode: form.itemCode,
      description: form.description,
      uom: form.uom,
      costPrice: parseFloat(form.costPrice),
      sellPrice: parseFloat(form.sellPrice),
      quantity: parseInt(form.quantity),
      minStock: parseInt(form.minStock) || 5,
      categoryId: form.categoryId || undefined,
      brandId: form.brandId || undefined,
      countryOfOrigin: form.countryOfOrigin || undefined,
      isTyre: form.isTyre,
      tyreSize: form.isTyre ? form.tyreSize || undefined : undefined,
    } as any)
    toast.success('Item updated successfully')
    router.push('/app/stock')
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to update item')
  } finally {
    saving.value = false
  }
}

const filteredBrands = computed(() =>
  form.categoryId ? stock.brands.filter((b) => b.categoryId === form.categoryId) : []
)

onMounted(() => {
  loadItem()
  stock.fetchCategories()
})

watch(() => route.params.id, () => loadItem())
watch(() => form.categoryId, (newVal, oldVal) => {
  if (oldVal && newVal !== oldVal) form.brandId = ''
  if (newVal) stock.fetchBrands(newVal)
})
</script>
