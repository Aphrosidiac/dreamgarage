<template>
  <div class="max-w-6xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white">Global Dashboard</h1>
      <p class="text-sm text-dark-400 mt-1">Stock overview across all branches</p>
    </div>

    <!-- Summary -->
    <div v-if="branches.length" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-dark-900 border border-dark-800 rounded-xl p-4">
        <p class="text-dark-400 text-xs uppercase tracking-wider mb-1">Branches</p>
        <p class="text-dark-100 text-xl font-bold">{{ branches.length }}</p>
      </div>
      <div class="bg-dark-900 border border-dark-800 rounded-xl p-4">
        <p class="text-dark-400 text-xs uppercase tracking-wider mb-1">Total Items</p>
        <p class="text-dark-100 text-xl font-bold">{{ totalItems }}</p>
      </div>
      <div class="bg-dark-900 border border-dark-800 rounded-xl p-4">
        <p class="text-dark-400 text-xs uppercase tracking-wider mb-1">Total Quantity</p>
        <p class="text-dark-100 text-xl font-bold">{{ totalQuantity }}</p>
      </div>
      <div class="bg-dark-900 border border-dark-800 rounded-xl p-4">
        <p class="text-dark-400 text-xs uppercase tracking-wider mb-1">Total Value</p>
        <p class="text-gold-500 text-xl font-bold">RM {{ totalValue.toFixed(2) }}</p>
      </div>
    </div>

    <div v-if="loading" class="text-dark-400 text-sm">Loading…</div>
    <div v-else-if="!branches.length" class="bg-dark-900 border border-dark-800 rounded-xl p-8 text-center text-dark-400">
      No branches found.
    </div>

    <!-- Branch sections -->
    <div v-else class="space-y-4">
      <div v-for="branch in branches" :key="branch.branchId" class="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
        <button @click="toggleBranch(branch.branchId)" class="w-full px-5 py-3 flex items-center justify-between hover:bg-dark-800/30 transition-colors">
          <div class="flex items-center gap-3">
            <ChevronDown class="w-4 h-4 text-dark-400 transition-transform" :class="expanded[branch.branchId] ? 'rotate-0' : '-rotate-90'" />
            <span class="text-white font-medium">{{ branch.branchName }}</span>
            <span class="text-xs text-dark-500 font-mono">{{ branch.branchCode }}</span>
            <span class="text-xs text-dark-500">{{ branch.totalItems }} items · {{ branch.totalQuantity }} units</span>
          </div>
          <span class="text-gold-500 text-sm font-semibold">RM {{ branch.totalValue.toFixed(2) }}</span>
        </button>

        <div v-show="expanded[branch.branchId]" class="border-t border-dark-800">
          <!-- Category sub-groups -->
          <div v-for="cat in branch.categories" :key="cat.categoryId ?? 'none'" class="border-b border-dark-800/50 last:border-0">
            <button @click="toggleCategory(branch.branchId, cat.categoryId ?? 'none')" class="w-full px-5 py-2.5 flex items-center gap-3 hover:bg-dark-800/20 transition-colors">
              <ChevronDown class="w-3.5 h-3.5 text-dark-500 transition-transform ml-2" :class="expandedCats[branch.branchId + ':' + (cat.categoryId ?? 'none')] ? 'rotate-0' : '-rotate-90'" />
              <span class="text-dark-200 text-sm font-medium">{{ cat.categoryName }}</span>
              <span class="text-xs text-dark-500">{{ cat.items.length }} items</span>
            </button>

            <div v-show="expandedCats[branch.branchId + ':' + (cat.categoryId ?? 'none')]">
              <div v-for="item in cat.items" :key="item.id" class="px-5 py-2.5 pl-12 flex items-center justify-between border-t border-dark-800/30">
                <div class="flex items-center gap-3">
                  <span v-if="item.itemCode" class="text-gold-500 font-mono text-xs">{{ item.itemCode }}</span>
                  <span class="text-white text-sm">{{ item.description }}</span>
                  <span v-if="item.brand" class="text-dark-500 text-xs">{{ item.brand.name }}</span>
                </div>
                <div class="flex items-center gap-4 text-xs">
                  <span class="text-dark-400">Qty: <span class="text-dark-200 font-mono">{{ item.quantity }} {{ item.uom }}</span></span>
                  <span class="text-dark-400">Cost: <span class="text-dark-200 font-mono">RM {{ Number(item.costPrice).toFixed(2) }}</span></span>
                  <span class="text-dark-400">Price: <span class="text-gold-500 font-mono">RM {{ Number(item.sellPrice).toFixed(2) }}</span></span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!branch.categories.length" class="px-5 py-4 text-dark-500 text-sm text-center">
            No stock items in this branch.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../../lib/api'
import { ChevronDown } from 'lucide-vue-next'

interface StockItem {
  id: string
  itemCode: string | null
  description: string
  uom: string
  quantity: number
  costPrice: number
  sellPrice: number
  brand: { id: string; name: string } | null
}

interface Category {
  categoryId: string | null
  categoryName: string
  items: StockItem[]
}

interface BranchStock {
  branchId: string
  branchName: string
  branchCode: string
  totalItems: number
  totalQuantity: number
  totalValue: number
  categories: Category[]
}

const branches = ref<BranchStock[]>([])
const loading = ref(true)
const expanded = reactive<Record<string, boolean>>({})
const expandedCats = reactive<Record<string, boolean>>({})

const totalItems = computed(() => branches.value.reduce((s, b) => s + b.totalItems, 0))
const totalQuantity = computed(() => branches.value.reduce((s, b) => s + b.totalQuantity, 0))
const totalValue = computed(() => branches.value.reduce((s, b) => s + b.totalValue, 0))

function toggleBranch(id: string) { expanded[id] = !expanded[id] }
function toggleCategory(branchId: string, catId: string) {
  const key = branchId + ':' + catId
  expandedCats[key] = !expandedCats[key]
}

onMounted(async () => {
  try {
    const { data } = await api.get('/stock/global')
    branches.value = data.data
    for (const b of branches.value) {
      expanded[b.branchId] = true
      for (const c of b.categories) {
        expandedCats[b.branchId + ':' + (c.categoryId ?? 'none')] = true
      }
    }
  } finally { loading.value = false }
})
</script>
