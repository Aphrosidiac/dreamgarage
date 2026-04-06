<template>
  <div class="h-screen w-screen bg-[#08090c] overflow-hidden flex flex-col font-sans select-none">
    <!-- Header Bar -->
    <header class="flex items-center justify-between px-8 py-3 bg-[#0c0d12] border-b border-white/5">
      <div class="flex items-center gap-4">
        <img src="/logo-nav.png" alt="Dream Garage" class="h-7" />
        <div class="h-5 w-px bg-white/10"></div>
        <h1 class="text-white/60 text-xs font-medium tracking-[0.3em] uppercase">Workshop Live</h1>
      </div>
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-5 text-xs">
          <span class="text-white/30">{{ totalJobs }} Jobs</span>
          <span class="text-amber-400">{{ waitingCount }} Waiting</span>
          <span class="text-blue-400">{{ inProgressCount }} In Progress</span>
          <span class="text-emerald-400">{{ readyCount }} Ready</span>
        </div>
        <div class="h-5 w-px bg-white/10"></div>
        <div class="text-right">
          <p class="text-white/80 text-sm font-semibold tabular-nums">{{ currentTime }}</p>
          <p class="text-white/30 text-[10px]">{{ currentDate }}</p>
        </div>
      </div>
    </header>

    <!-- Columns by Status -->
    <main class="flex-1 flex gap-0 overflow-hidden">
      <!-- Waiting Column -->
      <section class="flex-1 flex flex-col border-r border-white/5 min-w-0">
        <div class="px-4 py-2.5 bg-amber-500/5 border-b border-amber-500/10 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          <span class="text-amber-400 text-xs font-semibold uppercase tracking-wider">Waiting</span>
          <span class="text-amber-400/40 text-xs ml-auto">{{ waitingCount }}</span>
        </div>
        <div class="flex-1 overflow-y-auto p-3 space-y-2">
          <div
            v-for="job in waitingJobs"
            :key="job.id"
            class="bg-[#0f1015] border border-amber-500/10 rounded-lg p-3"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-white font-bold text-base tracking-wider font-mono">{{ job.plate }}</span>
              <span class="text-white/20 text-xs tabular-nums">{{ formatElapsed(job.elapsed) }}</span>
            </div>
            <p class="text-white/30 text-xs mb-2">{{ job.vehicle }}</p>
            <p class="text-white/50 text-xs mb-2">{{ job.customer }}</p>
            <div class="space-y-1 mb-2">
              <p v-for="(s, i) in job.services" :key="i" class="text-white/40 text-xs">{{ s }}</p>
            </div>
            <div class="flex items-center gap-1.5 pt-2 border-t border-white/5">
              <div class="w-5 h-5 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center text-[10px] font-bold">{{ job.foreman.charAt(0) }}</div>
              <span class="text-white/30 text-xs">{{ job.foreman }}</span>
            </div>
          </div>
          <div v-if="!waitingJobs.length" class="text-white/10 text-xs text-center py-8">No waiting jobs</div>
        </div>
      </section>

      <!-- In Progress Column -->
      <section class="flex-[2] flex flex-col border-r border-white/5 min-w-0">
        <div class="px-4 py-2.5 bg-blue-500/5 border-b border-blue-500/10 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          <span class="text-blue-400 text-xs font-semibold uppercase tracking-wider">In Progress</span>
          <span class="text-blue-400/40 text-xs ml-auto">{{ inProgressCount }}</span>
        </div>
        <div class="flex-1 overflow-y-auto p-3">
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="job in progressJobs"
              :key="job.id"
              class="bg-[#0f1015] border border-blue-500/10 rounded-lg p-3"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-white font-bold text-base tracking-wider font-mono">{{ job.plate }}</span>
                <span :class="['text-xs tabular-nums', job.elapsed > 120 ? 'text-red-400' : 'text-white/20']">{{ formatElapsed(job.elapsed) }}</span>
              </div>
              <p class="text-white/30 text-xs mb-2">{{ job.vehicle }}</p>
              <p class="text-white/50 text-xs mb-2">{{ job.customer }}</p>
              <div class="space-y-1 mb-2">
                <p v-for="(s, i) in job.services" :key="i" class="text-white/40 text-xs">{{ s }}</p>
              </div>
              <div class="flex items-center gap-1.5 pt-2 border-t border-white/5">
                <div class="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center text-[10px] font-bold">{{ job.foreman.charAt(0) }}</div>
                <span class="text-white/30 text-xs">{{ job.foreman }}</span>
              </div>
            </div>
          </div>
          <div v-if="!progressJobs.length" class="text-white/10 text-xs text-center py-8">No jobs in progress</div>
        </div>
      </section>

      <!-- Ready Column -->
      <section class="flex-1 flex flex-col min-w-0">
        <div class="px-4 py-2.5 bg-emerald-500/5 border-b border-emerald-500/10 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span class="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Ready</span>
          <span class="text-emerald-400/40 text-xs ml-auto">{{ readyCount }}</span>
        </div>
        <div class="flex-1 overflow-y-auto p-3 space-y-2">
          <div
            v-for="job in readyJobs"
            :key="job.id"
            class="bg-[#0f1015] border border-emerald-500/10 rounded-lg p-3"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-white font-bold text-base tracking-wider font-mono">{{ job.plate }}</span>
              <span class="text-emerald-400/50 text-xs tabular-nums">{{ formatElapsed(job.elapsed) }}</span>
            </div>
            <p class="text-white/30 text-xs mb-2">{{ job.vehicle }}</p>
            <p class="text-white/50 text-xs mb-2">{{ job.customer }}</p>
            <div class="space-y-1 mb-2">
              <p v-for="(s, i) in job.services" :key="i" class="text-white/40 text-xs">{{ s }}</p>
            </div>
            <div class="flex items-center gap-1.5 pt-2 border-t border-white/5">
              <div class="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-[10px] font-bold">{{ job.foreman.charAt(0) }}</div>
              <span class="text-white/30 text-xs">{{ job.foreman }}</span>
            </div>
          </div>
          <div v-if="!readyJobs.length" class="text-white/10 text-xs text-center py-8">No ready jobs</div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="px-8 py-2 bg-[#0c0d12] border-t border-white/5 flex items-center justify-between">
      <p class="text-white/15 text-[10px]">Dream Garage (M) Sdn Bhd</p>
      <div class="flex items-center gap-1.5">
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <p class="text-white/15 text-[10px]">Live</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ─── Live Clock ───────────────────────────────────
const currentTime = ref('')
const currentDate = ref('')
let clockTimer: ReturnType<typeof setInterval>

function updateClock() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  currentDate.value = now.toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// ─── Placeholder Data ─────────────────────────────
interface Job {
  id: string
  plate: string
  vehicle: string
  customer: string
  services: string[]
  foreman: string
  status: 'waiting' | 'progress' | 'ready'
  elapsed: number
}

const jobs = ref<Job[]>([
  {
    id: '1', plate: 'JQR 1234', vehicle: 'Toyota Camry 2.5V — White',
    customer: 'Ahmad bin Ismail', services: ['4x Michelin Tyres 225/45R18', 'Wheel Alignment', 'Nitrogen Fill'],
    foreman: 'Ahmad Foreman', status: 'progress', elapsed: 105,
  },
  {
    id: '2', plate: 'BML 5678', vehicle: 'BMW 320i G20 — Black',
    customer: 'Tan Wei Ming', services: ['Engine Oil Service (Motul 5W-40)', 'Oil Filter Replacement', 'Air Filter'],
    foreman: 'Rizal Mechanic', status: 'progress', elapsed: 45,
  },
  {
    id: '3', plate: 'WA 9012 C', vehicle: 'Mercedes C200 W206 — Silver',
    customer: 'Siti Nurhaliza', services: ['Brake Pad Replacement (Front)', 'Brake Disc Resurfacing'],
    foreman: 'Wei Liang Foreman', status: 'waiting', elapsed: 15,
  },
  {
    id: '4', plate: 'JHR 3456', vehicle: 'Honda Civic FE — Grey',
    customer: 'Raj Kumar', services: ['Full Service Package', 'Spark Plug Replacement'],
    foreman: 'Muthu Mechanic', status: 'ready', elapsed: 180,
  },
  {
    id: '5', plate: 'JDT 7890', vehicle: 'Perodua Ativa — Red',
    customer: 'Lee Chong Wei', services: ['Battery Replacement (Amaron)', 'Alternator Check'],
    foreman: 'Jason Technician', status: 'progress', elapsed: 60,
  },
  {
    id: '6', plate: 'BNP 2345', vehicle: 'Nissan GT-R R35 — Blue',
    customer: 'Mohd Faiz', services: ['4x Continental CSC7 275/35R20', 'Computerized Alignment', 'Tyre Balancing'],
    foreman: 'Ahmad Foreman', status: 'waiting', elapsed: 5,
  },
  {
    id: '7', plate: 'WKP 6789', vehicle: 'Tesla Model 3 — White',
    customer: 'James Wong', services: ['Tyre Rotation', 'Brake Fluid Flush'],
    foreman: 'Ali Salesman', status: 'ready', elapsed: 210,
  },
  {
    id: '8', plate: 'JKR 4567', vehicle: 'Proton X50 — Orange',
    customer: 'Nurul Izzah', services: ['Absorber Replacement (KYB)', 'Strut Mount Replacement'],
    foreman: 'Rizal Mechanic', status: 'progress', elapsed: 90,
  },
])

const waitingJobs = computed(() => jobs.value.filter(j => j.status === 'waiting'))
const progressJobs = computed(() => jobs.value.filter(j => j.status === 'progress'))
const readyJobs = computed(() => jobs.value.filter(j => j.status === 'ready'))
const waitingCount = computed(() => waitingJobs.value.length)
const inProgressCount = computed(() => progressJobs.value.length)
const readyCount = computed(() => readyJobs.value.length)
const totalJobs = computed(() => jobs.value.length)

function formatElapsed(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

let tickTimer: ReturnType<typeof setInterval>

onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
  tickTimer = setInterval(() => {
    jobs.value.forEach(j => { if (j.status !== 'ready') j.elapsed++ })
  }, 60000)
})

onUnmounted(() => {
  clearInterval(clockTimer)
  clearInterval(tickTimer)
})
</script>
