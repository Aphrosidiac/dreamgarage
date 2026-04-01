<template>
  <div>
    <div v-if="dashboard.loading" class="text-dark-400">Loading dashboard...</div>

    <div v-else-if="dashboard.error" class="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
      <p class="text-red-400">{{ dashboard.error }}</p>
      <button @click="dashboard.fetchAll()" class="mt-3 text-sm text-gold-500 hover:text-gold-400">Retry</button>
    </div>

    <template v-else-if="dashboard.stats">
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div v-for="stat in statCards" :key="stat.label" class="bg-dark-900 border border-dark-800 rounded-xl p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" :class="stat.iconBg">
              <component :is="stat.icon" class="w-4.5 h-4.5" :class="stat.iconColor" />
            </div>
          </div>
          <p class="text-2xl font-bold text-dark-100">{{ stat.value }}</p>
          <p class="text-xs text-dark-400 mt-1">{{ stat.label }}</p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Low Stock Alert -->
        <BaseCard title="Low Stock Alert">
          <template #header-action>
            <BaseBadge v-if="dashboard.lowStock.length" color="red">{{ dashboard.lowStock.length }}</BaseBadge>
          </template>
          <div v-if="!dashboard.lowStock.length" class="text-dark-500 text-sm py-4 text-center">All stock levels are healthy.</div>
          <div v-else class="space-y-2 max-h-64 overflow-y-auto">
            <div
              v-for="item in dashboard.lowStock"
              :key="item.id"
              class="flex items-center justify-between py-2 border-b border-dark-800 last:border-0"
            >
              <div>
                <span class="font-mono text-gold-500 text-sm">{{ item.itemCode }}</span>
                <span class="text-dark-300 text-sm ml-2">{{ item.description }}</span>
              </div>
              <span class="text-red-400 font-semibold text-sm">{{ item.quantity }} left</span>
            </div>
          </div>
        </BaseCard>

        <!-- Recent Invoices -->
        <BaseCard title="Recent Invoices">
          <template #header-action>
            <RouterLink to="/app/documents?type=INVOICE" class="text-gold-500 text-xs hover:text-gold-400">View all</RouterLink>
          </template>
          <div v-if="!dashboard.recentInvoices.length" class="text-dark-500 text-sm py-4 text-center">No invoices yet.</div>
          <div v-else class="space-y-2 max-h-64 overflow-y-auto">
            <RouterLink
              v-for="inv in dashboard.recentInvoices"
              :key="inv.id"
              :to="`/app/documents/${inv.id}`"
              class="flex items-center justify-between py-2 border-b border-dark-800 last:border-0 hover:bg-dark-800/30 -mx-2 px-2 rounded transition-colors"
            >
              <div>
                <span class="font-mono text-gold-500 text-sm">{{ (inv as any).documentNumber }}</span>
                <span class="text-dark-500 text-xs ml-2">{{ new Date((inv as any).issueDate).toLocaleDateString('en-MY') }}</span>
              </div>
              <div class="flex items-center gap-3">
                <BaseBadge :color="statusColor(inv.status)">{{ inv.status }}</BaseBadge>
                <span class="text-dark-200 text-sm font-medium">RM {{ Number(inv.totalAmount).toFixed(2) }}</span>
              </div>
            </RouterLink>
          </div>
        </BaseCard>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useDashboardStore } from '../../stores/dashboard'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseBadge from '../../components/base/BaseBadge.vue'
import { Package, FileText, TrendingUp } from 'lucide-vue-next'

const dashboard = useDashboardStore()

function statusColor(status: string) {
  if (status === 'CONFIRMED') return 'green' as const
  if (status === 'VOID') return 'red' as const
  return 'gray' as const
}

const statCards = computed(() => [
  {
    label: 'Total Items',
    value: dashboard.stats?.totalItems || 0,
    icon: Package,
    iconBg: 'bg-gold-500/10',
    iconColor: 'text-gold-500',
  },
  {
    label: 'Invoices Today',
    value: dashboard.stats?.invoicesToday || 0,
    icon: FileText,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
  {
    label: 'Revenue Today',
    value: `RM ${(dashboard.stats?.revenueToday || 0).toFixed(2)}`,
    icon: TrendingUp,
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-400',
  },
  {
    label: 'Revenue This Month',
    value: `RM ${(dashboard.stats?.revenueThisMonth || 0).toFixed(2)}`,
    icon: TrendingUp,
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
  },
])

onMounted(() => dashboard.fetchAll())
</script>
