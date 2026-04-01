<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4 flex-1">
        <!-- Search -->
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            v-model="search"
            @input="debouncedFetch"
            type="text"
            placeholder="Search by item code or description..."
            class="w-full bg-dark-800 border border-dark-700 rounded-lg pl-10 pr-3 py-2 text-dark-100 text-sm placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
          />
        </div>
        <!-- Category filter -->
        <select
          v-model="categoryFilter"
          @change="fetchData"
          class="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
        >
          <option value="">All Categories</option>
          <option v-for="cat in stock.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>
      <div class="flex items-center gap-2 ml-4">
        <BaseButton variant="secondary" size="md" @click="handleExportPdf">
          <FileDown class="w-4 h-4 mr-1.5" /> Export PDF
        </BaseButton>
        <BaseButton variant="secondary" size="md" @click="showCategoryModal = true">
          <Tags class="w-4 h-4 mr-1.5" /> Categories
        </BaseButton>
        <BaseButton variant="primary" size="md" @click="$router.push('/app/stock/new')">
          <Plus class="w-4 h-4 mr-1.5" /> Add Item
        </BaseButton>
      </div>
    </div>

    <!-- Table -->
    <BaseTable :columns="columns" :data="stock.items" :loading="stock.loading" empty-text="No stock items found.">
      <template #cell-itemCode="{ value }">
        <span class="font-mono text-gold-500">{{ value }}</span>
      </template>
      <template #cell-category="{ row }">
        <BaseBadge v-if="row.category" color="gray">{{ row.category.name }}</BaseBadge>
        <span v-else class="text-dark-500">—</span>
      </template>
      <template #cell-costPrice="{ value }">
        RM {{ Number(value).toFixed(2) }}
      </template>
      <template #cell-sellPrice="{ value }">
        RM {{ Number(value).toFixed(2) }}
      </template>
      <template #cell-quantity="{ value }">
        <span :class="value <= 5 ? 'text-red-400 font-semibold' : ''">{{ value }}</span>
      </template>
      <template #actions="{ row }">
        <div class="flex items-center gap-1 justify-end">
          <button @click="$router.push(`/app/stock/${row.id}/history`)" class="p-1.5 text-dark-400 hover:text-blue-400 transition-colors" title="History">
            <History class="w-4 h-4" />
          </button>
          <button @click="$router.push(`/app/stock/${row.id}/edit`)" class="p-1.5 text-dark-400 hover:text-gold-500 transition-colors" title="Edit">
            <Pencil class="w-4 h-4" />
          </button>
          <button @click="confirmDelete(row as any)" class="p-1.5 text-dark-400 hover:text-red-400 transition-colors" title="Delete">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </template>
    </BaseTable>

    <!-- Pagination -->
    <BasePagination
      :page="stock.page"
      :total="stock.total"
      :limit="stock.limit"
      @update:page="(p) => { stock.page = p; fetchData() }"
    />

    <!-- Category Modal -->
    <BaseModal v-model="showCategoryModal" title="Manage Categories" size="md">
      <div class="space-y-3">
        <!-- Add category form -->
        <form @submit.prevent="handleAddCategory" class="flex gap-2">
          <input
            v-model="newCategoryName"
            placeholder="Category name"
            class="flex-1 bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
          />
          <input
            v-model="newCategoryCode"
            placeholder="Code"
            class="w-20 bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
          />
          <BaseButton variant="primary" size="md" type="submit" :disabled="!newCategoryName">Add</BaseButton>
        </form>
        <!-- List -->
        <div class="divide-y divide-dark-800 max-h-64 overflow-y-auto">
          <div v-for="cat in stock.categories" :key="cat.id" class="flex items-center justify-between py-2">
            <div>
              <span class="text-dark-100 text-sm">{{ cat.name }}</span>
              <span v-if="cat.code" class="text-dark-500 text-xs ml-2">({{ cat.code }})</span>
              <span v-if="cat._count" class="text-dark-500 text-xs ml-2">{{ cat._count.items }} items</span>
            </div>
            <button @click="handleDeleteCategory(cat.id)" class="text-dark-400 hover:text-red-400 transition-colors">
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
          <p v-if="!stock.categories.length" class="py-4 text-center text-dark-400 text-sm">No categories yet.</p>
        </div>
      </div>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal v-model="showDeleteModal" title="Delete Item" size="sm">
      <p class="text-dark-300 text-sm">
        Are you sure you want to delete <strong class="text-dark-100">{{ itemToDelete?.itemCode }}</strong>?
      </p>
      <template #footer>
        <BaseButton variant="secondary" @click="showDeleteModal = false">Cancel</BaseButton>
        <BaseButton variant="danger" @click="handleDelete" :loading="deleting">Delete</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useStockStore } from '../../stores/stock'
import { useToast } from '../../composables/useToast'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseTable from '../../components/base/BaseTable.vue'
import BasePagination from '../../components/base/BasePagination.vue'
import BaseBadge from '../../components/base/BaseBadge.vue'
import BaseModal from '../../components/base/BaseModal.vue'
import { Search, Plus, Pencil, Trash2, Tags, History, FileDown } from 'lucide-vue-next'
import { exportStockListPdf } from '../../lib/pdf-export'
import type { StockItem } from '../../types'

const stock = useStockStore()
const toast = useToast()

const search = ref('')
const categoryFilter = ref('')
const showCategoryModal = ref(false)
const showDeleteModal = ref(false)
const itemToDelete = ref<StockItem | null>(null)
const deleting = ref(false)
const newCategoryName = ref('')
const newCategoryCode = ref('')

const columns = [
  { key: 'itemCode', label: 'Item Code' },
  { key: 'description', label: 'Description' },
  { key: 'category', label: 'Category' },
  { key: 'uom', label: 'UOM' },
  { key: 'costPrice', label: 'Cost (RM)' },
  { key: 'sellPrice', label: 'Price (RM)' },
  { key: 'quantity', label: 'Qty' },
]

let debounceTimer: ReturnType<typeof setTimeout>
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { stock.page = 1; fetchData() }, 300)
}

function fetchData() {
  stock.fetchItems({
    search: search.value || undefined,
    categoryId: categoryFilter.value || undefined,
  })
}

function confirmDelete(item: StockItem) {
  itemToDelete.value = item
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!itemToDelete.value) return
  deleting.value = true
  try {
    await stock.deleteItem(itemToDelete.value.id)
    toast.success('Item deleted')
    showDeleteModal.value = false
    fetchData()
  } catch {
    toast.error('Failed to delete item')
  } finally {
    deleting.value = false
  }
}

async function handleAddCategory() {
  if (!newCategoryName.value) return
  try {
    await stock.createCategory({ name: newCategoryName.value, code: newCategoryCode.value || undefined })
    toast.success('Category added')
    newCategoryName.value = ''
    newCategoryCode.value = ''
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to add category')
  }
}

async function handleDeleteCategory(id: string) {
  try {
    await stock.deleteCategory(id)
    toast.success('Category deleted')
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to delete category')
  }
}

function handleExportPdf() {
  if (stock.items.length) {
    exportStockListPdf(stock.items)
    toast.success('PDF exported')
  }
}

onMounted(() => {
  fetchData()
  stock.fetchCategories()
})

onUnmounted(() => clearTimeout(debounceTimer))
</script>
