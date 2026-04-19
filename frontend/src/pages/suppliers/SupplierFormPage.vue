<template>
  <div class="max-w-2xl">
    <div class="flex items-center gap-3 mb-6">
      <button @click="$router.back()" class="text-dark-400 hover:text-dark-200 transition-colors">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h2 class="text-lg font-semibold text-dark-100">{{ isEdit ? 'Edit Supplier' : 'New Supplier' }}</h2>
    </div>

    <form @submit.prevent="handleSave" class="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-4">
      <h3 class="text-sm font-semibold text-dark-200 uppercase tracking-wider">Supplier Info</h3>
      <BaseInput v-model="form.companyName" label="Company Name" placeholder="Company name" required />

      <!-- Category dropdown -->
      <div>
        <label class="block text-sm font-medium text-dark-200 mb-1.5">Category</label>
        <div class="relative">
          <button type="button" @click="showCatDrop = !showCatDrop"
            class="w-full flex items-center justify-between bg-dark-800 border border-dark-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-colors"
          >
            <span :class="selectedCatName ? 'text-dark-100' : 'text-dark-500'">{{ selectedCatName || 'Select category...' }}</span>
            <svg class="w-4 h-4 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div v-if="showCatDrop" class="absolute z-20 mt-1 w-full bg-dark-800 border border-dark-700 rounded-lg shadow-xl overflow-hidden">
            <button type="button" @click="form.categoryId = ''; showCatDrop = false"
              :class="['w-full text-left px-3 py-2 text-sm transition-colors', !form.categoryId ? 'bg-gold-500/10 text-gold-500' : 'text-dark-400 hover:bg-dark-700']">
              None
            </button>
            <button v-for="cat in categories" :key="cat.id" type="button" @click="form.categoryId = cat.id; showCatDrop = false"
              :class="['w-full text-left px-3 py-2 text-sm transition-colors', form.categoryId === cat.id ? 'bg-gold-500/10 text-gold-500' : 'text-dark-200 hover:bg-dark-700']">
              {{ cat.name }}
            </button>
            <div v-if="categories.length === 0" class="px-3 py-2 text-dark-500 text-xs">No categories. Add them from the Suppliers page.</div>
          </div>
        </div>
      </div>

      <div class="grid sm:grid-cols-2 gap-4">
        <BaseInput v-model="form.contactName" label="Contact Person" placeholder="Contact name" />
        <BaseInput v-model="form.phone" label="Phone" placeholder="+60 12-345 6789" />
      </div>
      <BaseInput v-model="form.email" label="Email" type="email" placeholder="supplier@email.com" />
      <BaseInput v-model="form.address" label="Address" placeholder="Full address" />
      <div class="grid sm:grid-cols-2 gap-4">
        <BaseInput v-model="form.bankName" label="Bank Name" placeholder="e.g. Public Bank" />
        <BaseInput v-model="form.bankAccount" label="Bank Account" placeholder="Account number" />
      </div>
      <BaseInput v-model="form.notes" label="Notes" placeholder="Optional notes" />

      <div class="flex justify-end gap-3 pt-2">
        <BaseButton variant="secondary" type="button" @click="$router.back()">Cancel</BaseButton>
        <BaseButton variant="primary" type="submit" :loading="saving">{{ isEdit ? 'Update' : 'Create' }}</BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '../../composables/useToast'
import api from '../../lib/api'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import { ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const showCatDrop = ref(false)
const categories = ref<any[]>([])

const form = reactive({
  companyName: '',
  contactName: '',
  categoryId: '',
  phone: '',
  email: '',
  address: '',
  bankName: '',
  bankAccount: '',
  notes: '',
})

const selectedCatName = computed(() => {
  if (!form.categoryId) return ''
  return categories.value.find((c) => c.id === form.categoryId)?.name || ''
})

async function fetchCategories() {
  try {
    const { data } = await api.get('/supplier-categories')
    categories.value = data.data
  } catch { /* ignore */ }
}

async function loadSupplier() {
  if (!route.params.id) return
  try {
    const { data } = await api.get(`/suppliers/${route.params.id}`)
    const s = data.data
    form.companyName = s.companyName || ''
    form.contactName = s.contactName || ''
    form.categoryId = s.categoryId || ''
    form.phone = s.phone || ''
    form.email = s.email || ''
    form.address = s.address || ''
    form.bankName = s.bankName || ''
    form.bankAccount = s.bankAccount || ''
    form.notes = s.notes || ''
  } catch {
    toast.error('Failed to load supplier')
    router.push('/app/suppliers')
  }
}

async function handleSave() {
  saving.value = true
  try {
    const payload = { ...form, categoryId: form.categoryId || null }
    if (isEdit.value) {
      await api.put(`/suppliers/${route.params.id}`, payload)
      toast.success('Supplier updated')
    } else {
      await api.post('/suppliers', payload)
      toast.success('Supplier created')
    }
    router.push('/app/suppliers')
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to save')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchCategories()
  loadSupplier()
})
</script>
