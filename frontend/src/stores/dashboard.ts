import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../lib/api'
import type { StockItem, Document } from '../types'

interface DashboardStats {
  totalItems: number
  totalStockQty: number
  invoicesToday: number
  invoicesThisMonth: number
  revenueToday: number
  revenueThisMonth: number
}

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats | null>(null)
  const lowStock = ref<StockItem[]>([])
  const recentInvoices = ref<Document[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const [statsRes, lowStockRes, recentRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/low-stock'),
        api.get('/dashboard/recent-invoices'),
      ])
      stats.value = statsRes.data.data
      lowStock.value = lowStockRes.data.data
      recentInvoices.value = recentRes.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Failed to load dashboard'
    } finally {
      loading.value = false
    }
  }

  return { stats, lowStock, recentInvoices, loading, error, fetchAll }
})
