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
      <div class="p-5 border-b border-dark-800">
        <RouterLink to="/app/dashboard" class="flex items-center" @click="sidebarOpen = false">
          <img src="/logo-sidebar.png" alt="Dream Garage" class="h-16" />
        </RouterLink>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          @click="sidebarOpen = false"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="isActive(item.path) ? 'bg-gold-500/10 text-gold-500' : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800'"
        >
          <component :is="item.icon" class="w-5 h-5" />
          {{ item.label }}
        </RouterLink>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { LayoutDashboard, Package, Users, FileText, LogOut, Menu } from 'lucide-vue-next'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const sidebarOpen = ref(false)

const navItems = [
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/stock', label: 'Stock', icon: Package },
  { path: '/app/customers', label: 'Customers', icon: Users },
  { path: '/app/documents', label: 'Documents', icon: FileText },
]

const isActive = (path: string) => route.path.startsWith(path)

const pageTitle = computed(() => {
  const name = route.name as string
  if (name?.startsWith('stock')) return 'Stock Management'
  if (name?.startsWith('customer')) return 'Customers'
  if (name?.startsWith('document')) return 'Documents'
  if (name === 'dashboard') return 'Dashboard'
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
