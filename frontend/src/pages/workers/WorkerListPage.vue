<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-dark-100">Workers</h2>
      <div class="flex items-center gap-2">
        <BaseButton variant="secondary" size="md" @click="showRoleModal = true">
          <Tags class="w-4 h-4 mr-1.5" /> Roles
        </BaseButton>
        <BaseButton variant="primary" size="md" @click="openAdd">
          <Plus class="w-4 h-4 mr-1.5" /> Add Worker
        </BaseButton>
      </div>
    </div>

    <!-- Role filter -->
    <div class="flex items-center gap-1 mb-4 border-b border-dark-800">
      <button
        v-for="r in ['', ...roles]"
        :key="r"
        @click="roleFilter = r; "
        :class="[
          'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
          roleFilter === r
            ? 'text-gold-500 border-gold-500'
            : 'text-dark-400 border-transparent hover:text-dark-200',
        ]"
      >
        {{ r || 'All' }}
      </button>
    </div>

    <!-- Table -->
    <BaseTable :columns="columns" :data="filteredWorkers" :loading="loading" empty-text="No workers yet. Add your first worker.">
      <template #cell-name="{ value }">
        <span class="text-dark-100 font-medium">{{ value }}</span>
      </template>
      <template #cell-role="{ value }">
        <BaseBadge color="gold">{{ value }}</BaseBadge>
      </template>
      <template #cell-phone="{ value }">
        <span class="text-dark-400 text-sm">{{ value || '—' }}</span>
      </template>
      <template #cell-_count="{ row }">
        <span class="text-dark-400 text-sm">{{ row._count?.documents || 0 }}</span>
      </template>
      <template #actions="{ row }">
        <div class="flex items-center gap-1 justify-end">
          <button @click="openEdit(row)" class="p-1.5 text-dark-400 hover:text-gold-500 transition-colors" title="Edit">
            <Pencil class="w-4 h-4" />
          </button>
          <button @click="handleDelete(row)" class="p-1.5 text-dark-400 hover:text-red-400 transition-colors" title="Delete">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </template>
    </BaseTable>

    <!-- Add/Edit Modal -->
    <BaseModal v-model="showModal" :title="editingWorker ? 'Edit Worker' : 'Add Worker'" size="sm">
      <form @submit.prevent="handleSave" class="space-y-4">
        <BaseInput v-model="form.name" label="Name" placeholder="e.g. Ahmad" required />
        <BaseInput v-model="form.phone" label="Phone" placeholder="e.g. 012-3456789" />
        <BaseSelect v-model="form.role" label="Role">
          <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
        </BaseSelect>
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="showModal = false">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="handleSave">{{ editingWorker ? 'Update' : 'Add' }}</BaseButton>
      </template>
    </BaseModal>

    <!-- Roles Modal -->
    <BaseModal v-model="showRoleModal" title="Manage Roles" size="sm">
      <div class="space-y-3">
        <form @submit.prevent="handleAddRole" class="flex gap-2">
          <input
            v-model="newRole"
            placeholder="New role name"
            class="flex-1 bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
          />
          <BaseButton variant="primary" size="md" type="submit" :disabled="!newRole.trim()">Add</BaseButton>
        </form>
        <div class="divide-y divide-dark-800 max-h-64 overflow-y-auto">
          <div v-for="r in roles" :key="r" class="flex items-center justify-between py-2">
            <div>
              <span class="text-dark-100 text-sm">{{ r }}</span>
              <span class="text-dark-500 text-xs ml-2">{{ roleCount(r) }} worker{{ roleCount(r) !== 1 ? 's' : '' }}</span>
            </div>
            <button @click="handleDeleteRole(r)" class="text-dark-400 hover:text-red-400 transition-colors" :title="roleCount(r) > 0 ? 'Cannot delete — workers assigned' : 'Delete'">
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
          <p v-if="!roles.length" class="py-4 text-center text-dark-400 text-sm">No roles yet.</p>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../../lib/api'
import { useToast } from '../../composables/useToast'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseTable from '../../components/base/BaseTable.vue'
import BaseBadge from '../../components/base/BaseBadge.vue'
import BaseModal from '../../components/base/BaseModal.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseSelect from '../../components/base/BaseSelect.vue'
import { Plus, Pencil, Trash2, Tags } from 'lucide-vue-next'
import type { Worker } from '../../types'

const STORAGE_KEY = 'dg_worker_roles'
const DEFAULT_ROLES = ['Foreman', 'Salesman', 'Mechanic', 'Technician']

const toast = useToast()
const workers = ref<Worker[]>([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const showRoleModal = ref(false)
const editingWorker = ref<Worker | null>(null)
const roleFilter = ref('')
const newRole = ref('')

const roles = ref<string[]>(loadRoles())

function loadRoles(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return [...DEFAULT_ROLES]
}

function saveRoles() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roles.value))
}

const form = reactive({ name: '', phone: '', role: 'Foreman' })

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'phone', label: 'Phone' },
  { key: '_count', label: 'Orders' },
]

const filteredWorkers = computed(() =>
  roleFilter.value ? workers.value.filter((w) => w.role === roleFilter.value) : workers.value
)

function roleCount(role: string) {
  return workers.value.filter((w) => w.role === role).length
}

async function fetchWorkers() {
  loading.value = true
  try {
    const { data } = await api.get('/workers')
    workers.value = data.data
    // Sync roles from existing workers (in case they have roles not in our list)
    for (const w of workers.value) {
      if (w.role && !roles.value.includes(w.role)) {
        roles.value.push(w.role)
        saveRoles()
      }
    }
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

function openAdd() {
  editingWorker.value = null
  form.name = ''
  form.phone = ''
  form.role = roles.value[0] || 'Foreman'
  showModal.value = true
}

function openEdit(w: Worker) {
  editingWorker.value = w
  form.name = w.name
  form.phone = w.phone || ''
  form.role = w.role
  showModal.value = true
}

async function handleSave() {
  if (!form.name.trim()) return
  saving.value = true
  try {
    if (editingWorker.value) {
      await api.put(`/workers/${editingWorker.value.id}`, form)
      toast.success('Worker updated')
    } else {
      await api.post('/workers', form)
      toast.success('Worker added')
    }
    showModal.value = false
    fetchWorkers()
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to save worker')
  } finally {
    saving.value = false
  }
}

async function handleDelete(w: Worker) {
  if (!confirm(`Delete ${w.name}?`)) return
  try {
    await api.delete(`/workers/${w.id}`)
    toast.success('Worker removed')
    fetchWorkers()
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to delete')
  }
}

function handleAddRole() {
  const name = newRole.value.trim()
  if (!name) return
  if (roles.value.includes(name)) {
    toast.error('Role already exists')
    return
  }
  roles.value.push(name)
  saveRoles()
  newRole.value = ''
  toast.success('Role added')
}

function handleDeleteRole(role: string) {
  const count = roleCount(role)
  if (count > 0) {
    toast.error(`Cannot delete "${role}" — ${count} worker${count > 1 ? 's' : ''} assigned`)
    return
  }
  roles.value = roles.value.filter((r) => r !== role)
  saveRoles()
  toast.success('Role deleted')
}

onMounted(() => fetchWorkers())
</script>
