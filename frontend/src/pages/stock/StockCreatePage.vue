<template>
  <div class="max-w-2xl">
    <div class="flex items-center gap-3 mb-6">
      <button @click="$router.back()" class="text-dark-400 hover:text-dark-200 transition-colors">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h2 class="text-lg font-semibold text-dark-100">Add New Stock Item</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="form.itemCode" label="Item Code" placeholder="e.g. TYR-MIC-001" required />
        <BaseSelect v-model="form.categoryId" label="Category" placeholder="Select category">
          <option v-for="cat in stock.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </BaseSelect>
      </div>

      <BaseInput v-model="form.description" label="Description" placeholder="e.g. Michelin Primacy 4 215/55R17" required />

      <div class="grid grid-cols-3 gap-4">
        <BaseSelect v-model="form.uom" label="UOM">
          <option v-for="u in uomOptions" :key="u" :value="u">{{ u }}</option>
        </BaseSelect>
        <BaseInput v-model="form.costPrice" label="Cost Price (RM)" type="number" step="0.01" min="0" required />
        <BaseInput v-model="form.sellPrice" label="Sell Price (RM)" type="number" step="0.01" min="0" required />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="form.quantity" label="Initial Quantity" type="number" min="0" />
        <BaseInput v-model="form.minStock" label="Min Stock Alert" type="number" min="0" placeholder="Default: 5" />
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <BaseButton variant="secondary" type="button" @click="$router.back()">Cancel</BaseButton>
        <BaseButton variant="primary" type="submit" :loading="saving">Save Item</BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStockStore } from '../../stores/stock'
import { useToast } from '../../composables/useToast'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseSelect from '../../components/base/BaseSelect.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const stock = useStockStore()
const toast = useToast()
const saving = ref(false)

const uomOptions = ['PCS', 'SET', 'LITRE', 'BOX', 'UNIT', 'PAIR', 'KG']

const form = reactive({
  itemCode: '',
  description: '',
  uom: 'PCS',
  costPrice: '',
  sellPrice: '',
  quantity: '0',
  minStock: '5',
  categoryId: '',
})

async function handleSubmit() {
  saving.value = true
  try {
    await stock.createItem({
      itemCode: form.itemCode,
      description: form.description,
      uom: form.uom,
      costPrice: parseFloat(form.costPrice),
      sellPrice: parseFloat(form.sellPrice),
      quantity: parseInt(form.quantity),
      minStock: parseInt(form.minStock) || 5,
      categoryId: form.categoryId || undefined,
    })
    toast.success('Item created successfully')
    router.push('/app/stock')
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to create item')
  } finally {
    saving.value = false
  }
}

onMounted(() => stock.fetchCategories())
</script>
