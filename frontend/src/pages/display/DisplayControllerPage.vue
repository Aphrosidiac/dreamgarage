<template>
  <div>
    <!-- Filter tabs -->
    <div class="flex items-center gap-2 mb-5 flex-wrap">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeFilter = tab.value"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeFilter === tab.value
            ? tab.activeClass
            : 'bg-dark-800 text-dark-400 hover:text-dark-200',
        ]"
      >
        {{ tab.label }}
        <span class="ml-1.5 text-xs opacity-60">{{ tab.count }}</span>
      </button>

      <div class="ml-auto">
        <input
          v-model="search"
          type="search"
          placeholder="Search plate or customer..."
          class="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 w-56"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-dark-400 text-center py-12">Loading jobs...</div>

    <!-- Empty -->
    <div v-else-if="filteredJobs.length === 0" class="text-dark-500 text-center py-12">No jobs found.</div>

    <!-- Job cards grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div
        v-for="job in filteredJobs"
        :key="job.id"
        :class="[
          'rounded-xl border p-4 transition-all flex flex-col',
          statusStyle[job.workshopStatus]?.card || 'bg-dark-900 border-dark-800',
        ]"
      >
        <!-- Header: plate + elapsed -->
        <div class="flex items-start justify-between mb-2">
          <div>
            <span class="text-base font-bold font-mono tracking-wider text-dark-100">{{ job.plate }}</span>
            <span :class="['ml-2 text-xs font-medium px-1.5 py-0.5 rounded', statusStyle[job.workshopStatus]?.badge || 'bg-dark-700 text-dark-400']">
              {{ statusLabel[job.workshopStatus] }}
            </span>
          </div>
          <span :class="['text-xs tabular-nums', job.elapsed > 120 ? 'text-red-400' : 'text-dark-500']">{{ formatElapsed(job.elapsed) }}</span>
        </div>

        <!-- Info -->
        <div class="flex-1 space-y-1 mb-3">
          <p v-if="job.vehicle" class="text-dark-400 text-xs">{{ job.vehicle }}</p>
          <p class="text-dark-300 text-sm">{{ job.customer }}</p>
          <div class="text-dark-400 text-xs leading-relaxed">
            <p v-for="(s, i) in job.services.slice(0, 3)" :key="i">{{ s }}</p>
            <p v-if="job.services.length > 3" class="text-dark-500">+{{ job.services.length - 3 }} more</p>
          </div>
          <p v-if="job.foreman" class="text-dark-500 text-xs mt-1">{{ job.foreman }}</p>
        </div>

        <!-- Action button -->
        <button
          v-if="job.workshopStatus === 'WAITING'"
          @click="updateStatus(job, 'IN_PROGRESS')"
          :disabled="updatingId === job.id"
          class="w-full py-4 sm:py-2.5 rounded-lg text-base sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white transition-colors disabled:opacity-50 min-h-[48px]"
        >
          {{ updatingId === job.id ? '...' : 'Start Work' }}
        </button>
        <button
          v-else-if="job.workshopStatus === 'IN_PROGRESS'"
          @click="updateStatus(job, 'READY')"
          :disabled="updatingId === job.id"
          class="w-full py-4 sm:py-2.5 rounded-lg text-base sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white transition-colors disabled:opacity-50 min-h-[48px]"
        >
          {{ updatingId === job.id ? '...' : 'Mark Ready' }}
        </button>
        <div v-else-if="job.workshopStatus === 'READY'" class="flex gap-2">
          <button
            @click="updateStatus(job, 'DONE')"
            :disabled="updatingId === job.id"
            class="flex-1 py-4 sm:py-2.5 rounded-lg text-base sm:text-sm font-semibold bg-dark-700 hover:bg-dark-600 active:bg-dark-500 text-dark-300 transition-colors disabled:opacity-50 min-h-[48px]"
          >
            {{ updatingId === job.id ? '...' : 'Remove from Display' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '../../lib/api'
import { useToast } from '../../composables/useToast'

const toast = useToast()

interface Job {
  id: string
  documentNumber: string
  plate: string
  vehicle: string
  customer: string
  services: string[]
  foreman: string | null
  workshopStatus: 'WAITING' | 'IN_PROGRESS' | 'READY'
  billingStatus: string
  elapsed: number
}

const jobs = ref<Job[]>([])
const loading = ref(true)
const search = ref('')
const activeFilter = ref<'ALL' | 'WAITING' | 'IN_PROGRESS' | 'READY'>('ALL')
const updatingId = ref<string | null>(null)

const statusLabel: Record<string, string> = {
  WAITING: 'Waiting',
  IN_PROGRESS: 'In Progress',
  READY: 'Ready',
}

const statusStyle: Record<string, { card: string; badge: string }> = {
  WAITING: { card: 'bg-dark-900 border-amber-500/20', badge: 'bg-amber-500/15 text-amber-400' },
  IN_PROGRESS: { card: 'bg-dark-900 border-blue-500/30', badge: 'bg-blue-500/15 text-blue-400' },
  READY: { card: 'bg-dark-900 border-emerald-500/30', badge: 'bg-emerald-500/15 text-emerald-400' },
}

const waitingCount = computed(() => jobs.value.filter((j) => j.workshopStatus === 'WAITING').length)
const progressCount = computed(() => jobs.value.filter((j) => j.workshopStatus === 'IN_PROGRESS').length)
const readyCount = computed(() => jobs.value.filter((j) => j.workshopStatus === 'READY').length)

const tabs = computed(() => [
  { value: 'ALL' as const, label: 'All', count: jobs.value.length, activeClass: 'bg-gold-500/15 text-gold-500' },
  { value: 'WAITING' as const, label: 'Waiting', count: waitingCount.value, activeClass: 'bg-amber-500/15 text-amber-400' },
  { value: 'IN_PROGRESS' as const, label: 'In Progress', count: progressCount.value, activeClass: 'bg-blue-500/15 text-blue-400' },
  { value: 'READY' as const, label: 'Ready', count: readyCount.value, activeClass: 'bg-emerald-500/15 text-emerald-400' },
])

const filteredJobs = computed(() => {
  let list = jobs.value
  if (activeFilter.value !== 'ALL') list = list.filter((j) => j.workshopStatus === activeFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter((j) => j.plate.toLowerCase().includes(q) || j.customer.toLowerCase().includes(q))
  }
  return list
})

function formatElapsed(min: number) {
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h ${m}m`
}

async function fetchJobs() {
  try {
    const { data } = await api.get('/shop-display/controller-jobs')
    jobs.value = data.data
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

async function updateStatus(job: Job, newStatus: 'WAITING' | 'IN_PROGRESS' | 'READY' | 'DONE') {
  updatingId.value = job.id
  const prev = job.workshopStatus
  if (newStatus !== 'DONE') job.workshopStatus = newStatus as any
  else jobs.value = jobs.value.filter((j) => j.id !== job.id)

  try {
    await api.patch(`/shop-display/documents/${job.id}/workshop-status`, { workshopStatus: newStatus })
  } catch (e: any) {
    job.workshopStatus = prev
    await fetchJobs()
    toast.error(e.response?.data?.message || 'Failed to update status')
  } finally {
    updatingId.value = null
  }
}

let pollTimer: ReturnType<typeof setInterval>
onMounted(() => {
  fetchJobs()
  pollTimer = setInterval(fetchJobs, 30000)
})
onUnmounted(() => clearInterval(pollTimer))
</script>
