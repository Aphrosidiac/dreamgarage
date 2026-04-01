import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 }
  },
  routes: [
    // Public website
    {
      path: '/',
      component: () => import('../layouts/PublicLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('../pages/website/HomePage.vue') },
        { path: 'about', name: 'about', component: () => import('../pages/website/AboutPage.vue') },
        { path: 'services', name: 'services', component: () => import('../pages/website/ServicesPage.vue') },
        { path: 'contact', name: 'contact', component: () => import('../pages/website/ContactPage.vue') },
      ],
    },
    // Auth
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/auth/LoginPage.vue'),
    },
    // App (auth-guarded)
    {
      path: '/app',
      component: () => import('../layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/app/dashboard' },
        { path: 'dashboard', name: 'dashboard', component: () => import('../pages/dashboard/DashboardPage.vue') },
        { path: 'stock', name: 'stock-list', component: () => import('../pages/stock/StockListPage.vue') },
        { path: 'stock/new', name: 'stock-create', component: () => import('../pages/stock/StockCreatePage.vue') },
        { path: 'stock/:id/edit', name: 'stock-edit', component: () => import('../pages/stock/StockEditPage.vue') },
        { path: 'stock/:id/history', name: 'stock-history', component: () => import('../pages/stock/StockHistoryPage.vue') },
        { path: 'documents', name: 'document-list', component: () => import('../pages/documents/DocumentListPage.vue') },
        { path: 'documents/new', name: 'document-create', component: () => import('../pages/documents/DocumentFormPage.vue') },
        { path: 'documents/settings', name: 'document-settings', component: () => import('../pages/documents/DocumentSettingsPage.vue') },
        { path: 'documents/:id', name: 'document-view', component: () => import('../pages/documents/DocumentViewPage.vue') },
        { path: 'documents/:id/edit', name: 'document-edit', component: () => import('../pages/documents/DocumentFormPage.vue') },
        { path: 'profile', name: 'profile', component: () => import('../pages/profile/ProfilePage.vue') },
      ],
    },
  ],
})

// Auth guard
router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore()

  if (to.matched.some((r) => r.meta.requiresAuth)) {
    if (!auth.isAuthenticated) {
      return next('/login')
    }
    if (!auth.user) {
      await auth.fetchProfile()
    }
  }

  if (to.name === 'login' && auth.isAuthenticated) {
    return next('/app/dashboard')
  }

  next()
})

export default router
