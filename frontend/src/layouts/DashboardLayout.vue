<template>
  <div class="flex h-screen bg-dark-950">
    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-dark-900 border-r border-dark-800 flex flex-col transform transition-transform lg:relative lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Logo -->
      <div class="py-6 px-5 border-b border-dark-800">
        <RouterLink to="/app/dashboard" class="flex justify-center" @click="sidebarOpen = false">
          <img src="/logo-sidebar.png" alt="Dream Garage" class="h-20" />
        </RouterLink>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <template v-for="item in sidebarItems" :key="item.key || item.path">
          <!-- Expandable group -->
          <div v-if="item.children">
            <button
              @click="toggleGroup(item.key)"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              :class="isGroupActive(item) ? 'bg-gold-500/10 text-gold-500' : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800'"
            >
              <component :is="item.icon" class="w-5 h-5" />
              {{ item.label }}
              <ChevronDown
                class="w-4 h-4 ml-auto transition-transform duration-200 ease-out"
                :class="expandedGroups[item.key] ? 'rotate-180' : ''"
              />
            </button>
            <div
              class="grid transition-[grid-template-rows,opacity] duration-200 ease-out"
              :class="expandedGroups[item.key] ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
            >
              <div class="overflow-hidden">
                <div class="mt-1 ml-4 pl-3 border-l border-dark-700/50 space-y-0.5">
                  <RouterLink
                    v-for="child in item.children"
                    :key="child.path"
                    :to="child.path"
                    @click="sidebarOpen = false"
                    class="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors duration-150"
                    :class="isActive(child.path) ? 'bg-gold-500/10 text-gold-500' : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'"
                  >
                    <component :is="child.icon" class="w-4 h-4" />
                    {{ child.label }}
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>

          <!-- Standalone item -->
          <RouterLink
            v-else
            :to="item.path"
            @click="sidebarOpen = false"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            :class="isActive(item.path) ? 'bg-gold-500/10 text-gold-500' : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800'"
          >
            <component :is="item.icon" class="w-5 h-5" />
            {{ item.label }}
          </RouterLink>
        </template>
      </nav>

      <!-- User -->
      <div class="p-4 border-t border-dark-800">
        <div class="flex items-center gap-3">
          <RouterLink to="/app/profile" @click="sidebarOpen = false" class="w-8 h-8 bg-gold-500/20 rounded-full flex items-center justify-center hover:bg-gold-500/30 transition-colors">
            <span class="text-gold-500 text-xs font-bold">{{ userInitials }}</span>
          </RouterLink>
          <RouterLink to="/app/profile" @click="sidebarOpen = false" class="flex-1 min-w-0 hover:opacity-80 transition-opacity">
            <p class="text-sm font-medium text-dark-100 truncate">{{ auth.user?.name }}</p>
            <p class="text-xs text-dark-400 truncate">{{ auth.user?.email }}</p>
          </RouterLink>
          <button @click="handleLogout" class="text-dark-400 hover:text-red-400 transition-colors">
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top bar -->
      <header class="h-14 border-b border-dark-800 bg-dark-900/50 backdrop-blur-sm flex items-center px-6 gap-4">
        <button @click="sidebarOpen = true" class="lg:hidden text-dark-400 hover:text-dark-200">
          <Menu class="w-5 h-5" />
        </button>
        <h1 class="text-lg font-semibold text-dark-100">{{ pageTitle }}</h1>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>
    <AssistantWidget />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { LayoutDashboard, Package, Users, FileText, ClipboardList, AlertCircle, UserCog, LogOut, Menu, CircleDot, Monitor, SlidersHorizontal, Truck, CreditCard, ShieldCheck, Archive, ChevronDown, Wallet, BookUser } from 'lucide-vue-next'
import AssistantWidget from '../components/AssistantWidget.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const sidebarOpen = ref(false)

const allSidebarItems = [
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER'] },
  { path: '/app/take-order', label: 'Take Order', icon: ClipboardList, roles: ['ADMIN', 'MANAGER', 'WORKER'] },
  { path: '/app/stock', label: 'Stock', icon: Package, roles: ['ADMIN', 'MANAGER'] },
  { path: '/app/tyre-dashboard', label: 'Tyre Dashboard', icon: CircleDot, roles: ['ADMIN', 'MANAGER', 'WORKER'] },
  { path: '/app/display-controller', label: 'Display Controller', icon: SlidersHorizontal, roles: ['ADMIN', 'MANAGER', 'WORKER'] },
  { path: '/app/shop-display', label: 'Shop Display', icon: Monitor, roles: ['WORKER'] },
  {
    key: 'finance',
    label: 'Finance',
    icon: Wallet,
    roles: ['ADMIN', 'MANAGER'],
    children: [
      { path: '/app/documents', label: 'Documents', icon: FileText, roles: ['ADMIN', 'MANAGER'] },
      { path: '/app/reports/payment-log', label: 'Payments', icon: CreditCard, roles: ['ADMIN', 'MANAGER'] },
      { path: '/app/debtors', label: 'Debtors', icon: AlertCircle, roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    key: 'directory',
    label: 'Directory',
    icon: BookUser,
    roles: ['ADMIN', 'MANAGER'],
    children: [
      { path: '/app/staff', label: 'Staff', icon: UserCog, roles: ['ADMIN', 'MANAGER'] },
      { path: '/app/customers', label: 'Customers', icon: Users, roles: ['ADMIN', 'MANAGER'] },
      { path: '/app/suppliers', label: 'Suppliers', icon: Truck, roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  { path: '/app/held-stock', label: 'Held Stock', icon: Archive, roles: ['ADMIN', 'MANAGER', 'WORKER'] },
  { path: '/app/audit', label: 'Audit Logs', icon: ShieldCheck, roles: ['ADMIN'] },
]

const sidebarItems = computed(() => {
  const role = auth.user?.role || 'WORKER'
  return allSidebarItems
    .filter(item => item.roles.includes(role))
    .map(item => {
      if (item.children) {
        return { ...item, children: item.children.filter(c => c.roles.includes(role)) }
      }
      return item
    })
    .filter(item => !item.children || item.children.length > 0)
})

const expandedGroups = ref<Record<string, boolean>>(
  JSON.parse(localStorage.getItem('dg-sidebar-groups') || '{}')
)

function toggleGroup(key: string) {
  expandedGroups.value[key] = !expandedGroups.value[key]
  localStorage.setItem('dg-sidebar-groups', JSON.stringify(expandedGroups.value))
}

function isGroupActive(group: any) {
  return group.children?.some((child: any) => route.path.startsWith(child.path))
}

watch(() => route.path, () => {
  for (const item of sidebarItems.value) {
    if (item.children && isGroupActive(item)) {
      expandedGroups.value[item.key!] = true
      localStorage.setItem('dg-sidebar-groups', JSON.stringify(expandedGroups.value))
    }
  }
}, { immediate: true })

const isActive = (path: string) => route.path.startsWith(path)

const pageTitle = computed(() => {
  const name = route.name as string
  if (name?.startsWith('stock')) return 'Stock Management'
  if (name?.startsWith('staff')) return 'Staff Management'
  if (name?.startsWith('customer')) return 'Customers'
  if (name?.startsWith('document')) return 'Documents'
  if (name?.startsWith('supplier-payment')) return 'Payments'
  if (name?.startsWith('supplier')) return 'Suppliers'
  if (name?.startsWith('purchase-order')) return 'Purchase Orders'
  if (name === 'take-order') return 'Take Order'
  if (name === 'dashboard') return 'Dashboard'
  if (name === 'tyre-dashboard') return 'Tyre Dashboard'
  if (name === 'display-controller') return 'Display Controller'
  if (name?.startsWith('debtor')) return 'Debtors'
  if (name === 'payment-log') return 'Payments'
  if (name === 'profile') return 'Profile'
  return 'Dream Garage'
})

const userInitials = computed(() => {
  const name = auth.user?.name || ''
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
})

async function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>
