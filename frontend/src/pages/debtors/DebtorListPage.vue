<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-dark-100">Debtors</h2>
    </div>

    <!-- Summary -->
    <div v-if="debtors.length" class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-dark-900 border border-dark-800 rounded-xl p-4">
        <p class="text-dark-400 text-xs uppercase tracking-wider mb-1">Total Outstanding</p>
        <p class="text-red-400 text-xl font-bold">RM {{ grandTotal.toFixed(2) }}</p>
      </div>
      <div class="bg-dark-900 border border-dark-800 rounded-xl p-4">
        <p class="text-dark-400 text-xs uppercase tracking-wider mb-1">Debtors</p>
        <p class="text-dark-100 text-xl font-bold">{{ debtors.length }}</p>
      </div>
      <div class="bg-dark-900 border border-dark-800 rounded-xl p-4">
        <p class="text-dark-400 text-xs uppercase tracking-wider mb-1">Unpaid Invoices</p>
        <p class="text-dark-100 text-xl font-bold">{{ totalInvoices }}</p>
      </div>
    </div>

    <!-- Table -->
    <BaseTable :columns="columns" :data="debtors" :loading="loading" empty-text="No outstanding debtors.">
      <template #cell-name="{ row }">
        <RouterLink :to="`/app/debtors/${encodeURIComponent(row.id)}`" class="text-dark-100 hover:text-gold-500 font-medium transition-colors">
          {{ row.name }}
        </RouterLink>
      </template>
      <template #cell-phone="{ value }">
        <span class="text-dark-400 text-sm">{{ value || '—' }}</span>
      </template>
      <template #cell-plate="{ value }">
        <span v-if="value" class="text-gold-500 text-sm">{{ value }}</span>
        <span v-else class="text-dark-500">—</span>
      </template>
      <template #cell-invoiceCount="{ value }">
        {{ value }}
      </template>
      <template #cell-totalOwed="{ value }">
        <span class="text-red-400 font-semibold">RM {{ value.toFixed(2) }}</span>
      </template>
      <template #actions="{ row }">
        <RouterLink :to="`/app/debtors/${encodeURIComponent(row.id)}`" class="p-1.5 text-dark-400 hover:text-gold-500 transition-colors">
          <Eye class="w-4 h-4" />
        </RouterLink>
      </template>
    </BaseTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '../../lib/api'
import BaseTable from '../../components/base/BaseTable.vue'
import { Eye } from 'lucide-vue-next'

interface Debtor {
  id: string
  name: string
  phone?: string
  plate?: string
  invoiceCount: number
  totalOwed: number
}

const debtors = ref<Debtor[]>([])
const loading = ref(true)

const columns = [
  { key: 'name', label: 'Customer' },
  { key: 'phone', label: 'Phone' },
  { key: 'plate', label: 'Vehicle' },
  { key: 'invoiceCount', label: 'Invoices' },
  { key: 'totalOwed', label: 'Outstanding' },
]

const grandTotal = computed(() => debtors.value.reduce((sum, d) => sum + d.totalOwed, 0))
const totalInvoices = computed(() => debtors.value.reduce((sum, d) => sum + d.invoiceCount, 0))

onMounted(async () => {
  try {
    const { data } = await api.get('/debtors')
    debtors.value = data.data
  } catch { /* ignore */ } finally {
    loading.value = false
  }
})
</script>
