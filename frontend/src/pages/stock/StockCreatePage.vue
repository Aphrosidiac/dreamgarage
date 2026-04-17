<template>
  <div class="max-w-2xl">
    <div class="flex items-center gap-3 mb-6">
      <button @click="$router.back()" class="text-dark-400 hover:text-dark-200 transition-colors">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h2 class="text-lg font-semibold text-dark-100">Add New Stock Item</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="form.itemCode" label="Item Code" placeholder="e.g. TYR-MIC-001" required />
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

      <BaseInput v-model="form.description" label="Description" placeholder="e.g. Michelin Primacy 4 215/55R17" required />

      <div class="grid grid-cols-3 gap-4">
        <BaseSelect v-model="form.uom" label="UOM">
          <option v-for="u in uomOptions" :key="u" :value="u">{{ u }}</option>
        </BaseSelect>
        <BaseInput v-model="form.costPrice" label="Cost Price (RM)" type="number" step="0.01" min="0" required />
        <BaseInput v-model="form.sellPrice" label="Sell Price (RM)" type="number" step="0.01" min="0" required />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="form.quantity" label="Initial Quantity" type="number" min="0" :disabled="form.isTyre && dotBatches.length > 0" />
        <BaseInput v-model="form.minStock" label="Min Stock Alert" type="number" min="0" placeholder="Default: 5" />
      </div>

      <!-- Tyre options -->
      <div class="flex items-center gap-4 pt-2">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="form.isTyre" class="accent-gold-500" />
          <span class="text-dark-300 text-sm">This is a tyre item</span>
        </label>
        <BaseInput v-if="form.isTyre" v-model="form.tyreSize" label="Tyre Size" placeholder="e.g. 185/65R15" class="flex-1 max-w-xs" />
      </div>

      <!-- DOT Batches (tyre items) -->
      <div v-if="form.isTyre" class="border border-dark-700 rounded-lg p-4 mt-2">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-semibold text-dark-200 uppercase tracking-wider">DOT Batches</h4>
          <span class="text-dark-500 text-xs">Total: {{ dotBatchTotal }} pcs</span>
        </div>

        <div v-if="dotBatches.length" class="space-y-2 mb-3">
          <div v-for="(dot, idx) in dotBatches" :key="idx" class="flex items-center gap-3 bg-dark-800/50 rounded-lg px-3 py-2">
            <span class="text-dark-400 text-xs">DOT</span>
            <span class="text-dark-100 font-mono text-sm font-medium">{{ dot.code }}</span>
            <span class="text-gold-500 text-sm">{{ dot.quantity }} pcs</span>
            <button type="button" @click="dotBatches.splice(idx, 1)" class="ml-auto p-1 text-dark-400 hover:text-red-400 transition-colors">
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div v-else class="text-dark-500 text-sm mb-3">No DOT batches yet.</div>

        <div class="flex items-end gap-3">
          <BaseInput v-model="newDot.code" label="DOT Code" placeholder="e.g. 1206" class="flex-1" />
          <BaseInput v-model="newDot.quantity" label="Qty" type="number" min="1" class="w-24" />
          <BaseButton variant="secondary" size="sm" type="button" @click="addDotBatch" class="mb-0.5">
            <Plus class="w-4 h-4 mr-1" /> Add
          </BaseButton>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <BaseButton variant="secondary" type="button" @click="$router.back()">Cancel</BaseButton>
        <BaseButton variant="primary" type="submit" :loading="saving">Save Item</BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStockStore } from '../../stores/stock'
import { useToast } from '../../composables/useToast'
import api from '../../lib/api'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseSelect from '../../components/base/BaseSelect.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import { ArrowLeft, Plus, Trash2 } from 'lucide-vue-next'

const router = useRouter()
const stock = useStockStore()
const toast = useToast()
const saving = ref(false)

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

// DOT batch collection for tyre items
const dotBatches = ref<{ code: string; quantity: number }[]>([])
const dotBatchTotal = computed(() => dotBatches.value.reduce((s, d) => s + d.quantity, 0))
const newDot = reactive({ code: '', quantity: '1' })

function addDotBatch() {
  const code = newDot.code.replace(/\//g, '').trim()
  if (!code || !newDot.quantity) return
  if (!/^\d{4}$/.test(code)) {
    toast.error('DOT code must be 4 digits (WWYY)')
    return
  }
  const existing = dotBatches.value.find((d) => d.code === code)
  if (existing) {
    existing.quantity += parseInt(newDot.quantity)
  } else {
    dotBatches.value.push({ code, quantity: parseInt(newDot.quantity) })
  }
  newDot.code = ''
  newDot.quantity = '1'
}

async function handleSubmit() {
  saving.value = true
  try {
    const qty = form.isTyre && dotBatches.value.length > 0 ? dotBatchTotal.value : parseInt(form.quantity)
    const item = await stock.createItem({
      itemCode: form.itemCode,
      description: form.description,
      uom: form.uom,
      costPrice: parseFloat(form.costPrice),
      sellPrice: parseFloat(form.sellPrice),
      quantity: qty,
      minStock: parseInt(form.minStock) || 5,
      categoryId: form.categoryId || undefined,
      brandId: form.brandId || undefined,
      countryOfOrigin: form.countryOfOrigin || undefined,
      isTyre: form.isTyre,
      tyreSize: form.isTyre ? form.tyreSize || undefined : undefined,
    } as any)

    // Add DOT batches after item creation
    if (form.isTyre && dotBatches.value.length > 0 && item?.id) {
      for (const dot of dotBatches.value) {
        await api.post(`/stock/${item.id}/dots`, { dotCode: dot.code, quantity: dot.quantity })
      }
    }

    toast.success('Item created successfully')
    router.push('/app/stock')
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to create item')
  } finally {
    saving.value = false
  }
}

const filteredBrands = computed(() =>
  form.categoryId ? stock.brands.filter((b) => b.categoryId === form.categoryId) : []
)

watch(() => form.categoryId, (newVal) => {
  form.brandId = ''
  if (newVal) stock.fetchBrands(newVal)
})

onMounted(() => stock.fetchCategories())
</script>
