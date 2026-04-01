<template>
  <div class="max-w-2xl">
    <div class="flex items-center gap-3 mb-6">
      <button @click="$router.back()" class="text-dark-400 hover:text-dark-200 transition-colors">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h2 class="text-lg font-semibold text-dark-100">Edit Stock Item</h2>
    </div>

    <div v-if="loadingItem" class="text-dark-400">Loading...</div>

    <form v-else @submit.prevent="handleSubmit" class="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="form.itemCode" label="Item Code" required />
        <BaseSelect v-model="form.categoryId" label="Category" placeholder="Select category">
          <option v-for="cat in stock.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </BaseSelect>
      </div>

      <BaseInput v-model="form.description" label="Description" required />

      <div class="grid grid-cols-3 gap-4">
        <BaseSelect v-model="form.uom" label="UOM">
          <option v-for="u in uomOptions" :key="u" :value="u">{{ u }}</option>
        </BaseSelect>
        <BaseInput v-model="form.costPrice" label="Cost Price (RM)" type="number" step="0.01" min="0" required />
        <BaseInput v-model="form.sellPrice" label="Sell Price (RM)" type="number" step="0.01" min="0" required />
      </div>

      <BaseInput v-model="form.quantity" label="Quantity" type="number" min="0" />

      <div class="flex justify-end gap-3 pt-2">
        <BaseButton variant="secondary" type="button" @click="$router.back()">Cancel</BaseButton>
        <BaseButton variant="primary" type="submit" :loading="saving">Update Item</BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStockStore } from '../../stores/stock'
import { useToast } from '../../composables/useToast'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseSelect from '../../components/base/BaseSelect.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import { ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const stock = useStockStore()
const toast = useToast()
const saving = ref(false)
const loadingItem = ref(true)

const uomOptions = ['PCS', 'SET', 'LITRE', 'BOX', 'UNIT', 'PAIR', 'KG']

const form = reactive({
  itemCode: '',
  description: '',
  uom: 'PCS',
  costPrice: '',
  sellPrice: '',
  quantity: '0',
  categoryId: '',
})

async function loadItem() {
  loadingItem.value = true
  try {
    const item = await stock.getItem(route.params.id as string)
    form.itemCode = item.itemCode
    form.description = item.description
    form.uom = item.uom
    form.costPrice = String(item.costPrice)
    form.sellPrice = String(item.sellPrice)
    form.quantity = String(item.quantity)
    form.categoryId = item.categoryId || ''
  } catch {
    toast.error('Failed to load item')
    router.push('/app/stock')
  } finally {
    loadingItem.value = false
  }
}

async function handleSubmit() {
  saving.value = true
  try {
    await stock.updateItem(route.params.id as string, {
      itemCode: form.itemCode,
      description: form.description,
      uom: form.uom,
      costPrice: parseFloat(form.costPrice),
      sellPrice: parseFloat(form.sellPrice),
      quantity: parseInt(form.quantity),
      categoryId: form.categoryId || undefined,
    })
    toast.success('Item updated successfully')
    router.push('/app/stock')
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to update item')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadItem()
  stock.fetchCategories()
})

watch(() => route.params.id, () => loadItem())
</script>
