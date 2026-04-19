<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-dark-100">Suppliers</h2>
      <div class="flex items-center gap-2">
        <BaseButton variant="secondary" size="sm" @click="showCatModal = true">
          <Tag class="w-4 h-4 mr-1" /> Categories
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="$router.push('/app/suppliers/new')">
          <Plus class="w-4 h-4 mr-1" /> Add Supplier
        </BaseButton>
      </div>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <input v-model="search" type="text" placeholder="Search suppliers..." class="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 placeholder:text-dark-500 w-72" />
    </div>

    <!-- Table -->
    <BaseTable :columns="columns" :data="suppliers" :loading="loading" empty-text="No suppliers found.">
      <template #cell-companyName="{ row }">
        <span class="text-dark-100 font-medium">{{ row.companyName }}</span>
        <span v-if="!row.isActive" class="ml-2 text-xs text-red-400">(Inactive)</span>
      </template>
      <template #cell-contactName="{ value }">
        <span class="text-dark-300 text-sm">{{ value || '-' }}</span>
      </template>
      <template #cell-category="{ row }">
        <span v-if="row.supplierCategory" class="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gold-500/10 text-gold-500 border border-gold-500/20">{{ row.supplierCategory.name }}</span>
        <span v-else class="text-dark-500 text-sm">-</span>
      </template>
      <template #cell-phone="{ value }">
        <span class="text-dark-400 text-sm">{{ value || '-' }}</span>
      </template>
      <template #cell-email="{ value }">
        <span class="text-dark-400 text-sm">{{ value || '-' }}</span>
      </template>
      <template #actions="{ row }">
        <button @click="$router.push(`/app/suppliers/${row.id}/edit`)" class="p-1.5 text-dark-400 hover:text-blue-400 transition-colors">
          <Pencil class="w-4 h-4" />
        </button>
      </template>
    </BaseTable>

    <BasePagination v-if="totalPages > 1" :page="page" :total="totalPages * 20" :limit="20" @update:page="(p: number) => { page = p; fetchSuppliers() }" />

    <!-- Category Management Modal -->
    <BaseModal v-model="showCatModal" title="Supplier Categories" size="sm">
      <div class="space-y-4">
        <div class="flex gap-2">
          <input v-model="newCatName" @keydown.enter="addCategory" type="text" placeholder="New category name..." class="flex-1 bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
          <BaseButton variant="primary" size="sm" @click="addCategory" :disabled="!newCatName.trim()">Add</BaseButton>
        </div>
        <div v-if="categories.length === 0" class="text-dark-500 text-sm text-center py-4">No categories yet.</div>
        <div v-else class="space-y-1">
          <div v-for="cat in categories" :key="cat.id" class="flex items-center justify-between bg-dark-800/50 border border-dark-700 rounded-lg px-3 py-2">
            <div class="flex items-center gap-2">
              <span class="text-dark-200 text-sm">{{ cat.name }}</span>
              <span class="text-dark-500 text-xs">({{ cat._count.suppliers }})</span>
            </div>
            <button @click="deleteCategory(cat)" :disabled="cat._count.suppliers > 0" :class="['p-1 transition-colors', cat._count.suppliers > 0 ? 'text-dark-600 cursor-not-allowed' : 'text-dark-400 hover:text-red-400']">
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import api from '../../lib/api'
import { useToast } from '../../composables/useToast'
import BaseTable from '../../components/base/BaseTable.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseModal from '../../components/base/BaseModal.vue'
import BasePagination from '../../components/base/BasePagination.vue'
import { Plus, Pencil, Tag, Trash2 } from 'lucide-vue-next'

const toast = useToast()
const suppliers = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const page = ref(1)
const totalPages = ref(1)

const columns = [
  { key: 'companyName', label: 'Company' },
  { key: 'contactName', label: 'Contact' },
  { key: 'category', label: 'Category' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
]

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { page.value = 1; fetchSuppliers() }, 300)
})

async function fetchSuppliers() {
  loading.value = true
  try {
    const params: Record<string, any> = { page: page.value }
    if (search.value) params.search = search.value
    const { data } = await api.get('/suppliers', { params })
    suppliers.value = data.data
    totalPages.value = data.totalPages || 1
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

// Categories
const showCatModal = ref(false)
const categories = ref<any[]>([])
const newCatName = ref('')

async function fetchCategories() {
  try {
    const { data } = await api.get('/supplier-categories')
    categories.value = data.data
  } catch { /* ignore */ }
}

async function addCategory() {
  if (!newCatName.value.trim()) return
  try {
    await api.post('/supplier-categories', { name: newCatName.value.trim() })
    newCatName.value = ''
    await fetchCategories()
    toast.success('Category added')
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to add')
  }
}

async function deleteCategory(cat: any) {
  if (cat._count.suppliers > 0) return
  try {
    await api.delete(`/supplier-categories/${cat.id}`)
    await fetchCategories()
    toast.success('Category deleted')
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to delete')
  }
}

watch(showCatModal, (v) => { if (v) fetchCategories() })

onMounted(() => fetchSuppliers())
</script>
