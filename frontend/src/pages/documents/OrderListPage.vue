<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-dark-100">Order List</h2>
    </div>

    <!-- Filters -->
    <div class="flex items-end gap-4 mb-6 flex-wrap">
      <div class="flex-1 max-w-xs">
        <label class="block text-xs text-dark-400 mb-1">Search</label>
        <input v-model="search" type="text" placeholder="Invoice no, customer, plate..." class="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 placeholder:text-dark-500" />
      </div>
      <div>
        <label class="block text-xs text-dark-400 mb-1">Status</label>
        <select v-model="filterStatus" class="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50">
          <option value="">All</option>
          <option value="DRAFT">Draft</option>
          <option value="OUTSTANDING">Outstanding</option>
          <option value="PARTIAL">Partial</option>
          <option value="PAID">Paid</option>
        </select>
      </div>
      <div class="relative">
        <label class="block text-xs text-dark-400 mb-1">Per page</label>
        <button @click="showPerPage = !showPerPage" class="flex items-center gap-2 bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 min-w-[70px]">
          {{ perPage }}
          <ChevronDown class="w-3.5 h-3.5 text-dark-500 ml-auto" />
        </button>
        <div v-if="showPerPage" class="absolute z-20 mt-1 bg-dark-800 border border-dark-700 rounded-lg shadow-xl overflow-hidden min-w-[70px]">
          <button v-for="opt in [10, 50, 100]" :key="opt" @click="perPage = opt; showPerPage = false"
            :class="['w-full text-left px-3 py-2 text-sm transition-colors', perPage === opt ? 'bg-gold-500/10 text-gold-500' : 'text-dark-300 hover:bg-dark-700']">
            {{ opt }}
          </button>
        </div>
      </div>
    </div>

    <!-- Orders -->
    <div v-if="loading" class="text-dark-400 text-sm">Loading...</div>
    <div v-else-if="!orders.length" class="bg-dark-900 border border-dark-800 rounded-xl p-8 text-center text-dark-400">No orders found.</div>

    <div v-else class="space-y-3">
      <div v-for="order in orders" :key="order.id" class="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
        <!-- Order Header (clickable) -->
        <button @click="toggleExpand(order.id)" class="w-full flex items-center justify-between px-5 py-4 hover:bg-dark-800/50 transition-colors text-left">
          <div class="flex items-center gap-4">
            <span class="text-gold-500 font-mono text-sm font-medium">{{ order.documentNumber }}</span>
            <span class="text-dark-300 text-sm">{{ order.customerName || 'Walk-in' }}</span>
            <span v-if="order.vehiclePlate" class="text-dark-500 text-xs font-mono">{{ order.vehiclePlate }}</span>
          </div>
          <div class="flex items-center gap-4">
            <span :class="[
              'text-xs font-medium px-2 py-0.5 rounded-full',
              order.status === 'DRAFT' ? 'bg-dark-700 text-dark-300' :
              order.status === 'PAID' ? 'bg-green-500/10 text-green-400' :
              order.status === 'OUTSTANDING' || order.status === 'PARTIAL' ? 'bg-gold-500/10 text-gold-500' : 'bg-dark-700 text-dark-400'
            ]">{{ order.status }}</span>
            <span class="text-dark-200 text-sm font-medium">RM {{ Number(order.totalAmount).toFixed(2) }}</span>
            <span class="text-dark-400 text-xs">{{ formatDate(order.issueDate) }}</span>
            <ChevronDown :class="['w-4 h-4 text-dark-500 transition-transform', expanded.has(order.id) && 'rotate-180']" />
          </div>
        </button>

        <!-- Expanded Detail -->
        <div v-if="expanded.has(order.id)" class="border-t border-dark-800 px-5 py-4">
          <!-- Items Table -->
          <table class="w-full text-sm mb-4">
            <thead>
              <tr class="text-dark-500 text-xs uppercase border-b border-dark-800">
                <th class="py-2 text-left">#</th>
                <th class="py-2 text-left">Item</th>
                <th class="py-2 text-right">Qty</th>
                <th class="py-2 text-right">Price</th>
                <th class="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in order.items" :key="item.id" class="border-b border-dark-800/50">
                <td class="py-2 text-dark-500">{{ Number(i) + 1 }}</td>
                <td class="py-2">
                  <div class="flex items-center gap-2">
                    <a v-if="item.photoUrl" :href="item.photoUrl" target="_blank" class="shrink-0">
                      <img :src="item.photoUrl" class="w-8 h-8 object-cover rounded border border-dark-700 hover:border-gold-500/50" />
                    </a>
                    <div>
                      <span v-if="item.itemCode" class="text-gold-500 font-mono text-xs mr-2">{{ item.itemCode }}</span>
                      <span class="text-dark-200">{{ item.description }}</span>
                      <span v-if="item.serialNumber" class="text-dark-500 text-xs ml-2">S/N: {{ item.serialNumber }}</span>
                    </div>
                  </div>
                </td>
                <td class="py-2 text-right text-dark-300">{{ item.quantity }}</td>
                <td class="py-2 text-right text-dark-300">{{ Number(item.unitPrice).toFixed(2) }}</td>
                <td class="py-2 text-right text-dark-200 font-medium">{{ Number(item.total).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="flex items-center justify-between">
            <div class="text-dark-500 text-xs">
              <span v-if="order.foreman">Handled by: {{ order.foreman.name }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-dark-400 text-sm">Total:</span>
              <span class="text-dark-100 text-lg font-bold">RM {{ Number(order.totalAmount).toFixed(2) }}</span>
              <button v-if="order.status === 'DRAFT'" @click="editOrder(order)" class="ml-4 px-3 py-1.5 bg-gold-500/10 text-gold-500 border border-gold-500/20 rounded-lg text-xs font-medium hover:bg-gold-500/20 transition-colors">
                <Pencil class="w-3.5 h-3.5 inline mr-1" /> Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-start gap-2 mt-4">
      <button @click="prevPage" :disabled="page <= 1" :class="['px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', page <= 1 ? 'bg-dark-800 text-dark-600 cursor-not-allowed' : 'bg-dark-800 text-dark-200 hover:bg-dark-700']">Prev</button>
      <span class="text-dark-400 text-xs">{{ page }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page >= totalPages" :class="['px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', page >= totalPages ? 'bg-dark-800 text-dark-600 cursor-not-allowed' : 'bg-dark-800 text-dark-200 hover:bg-dark-700']">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../lib/api'
import { ChevronDown, Pencil } from 'lucide-vue-next'

const router = useRouter()
const orders = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const filterStatus = ref('')
const perPage = ref(10)
const showPerPage = ref(false)
const page = ref(1)
const totalPages = ref(1)
const expanded = reactive(new Set<string>())

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
}

function toggleExpand(id: string) {
  if (expanded.has(id)) expanded.delete(id)
  else expanded.add(id)
}

function editOrder(order: any) {
  router.push(`/app/documents/${order.id}/edit`)
}

let searchTimeout: ReturnType<typeof setTimeout>
watch([search, filterStatus], () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { page.value = 1; fetchOrders() }, 300)
})
watch(perPage, () => { page.value = 1; fetchOrders() })

async function fetchOrders() {
  loading.value = true
  try {
    const params: Record<string, any> = { type: 'INVOICE', limit: perPage.value, page: page.value, myOrders: true }
    if (search.value) params.search = search.value
    if (filterStatus.value) params.status = filterStatus.value
    const { data } = await api.get('/documents', { params })
    orders.value = data.data
    totalPages.value = data.totalPages || 1
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

function prevPage() { if (page.value > 1) { page.value--; fetchOrders() } }
function nextPage() { if (page.value < totalPages.value) { page.value++; fetchOrders() } }

onMounted(() => fetchOrders())
</script>
