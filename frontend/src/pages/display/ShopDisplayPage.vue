<template>
  <div class="h-screen w-screen bg-[#0a0b0e] overflow-hidden flex flex-col font-sans select-none">
    <!-- Header Bar -->
    <header class="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-[#0f1015] to-[#13141a] border-b border-white/5">
      <div class="flex items-center gap-4">
        <img src="/logo-nav.png" alt="Dream Garage" class="h-8" />
        <div class="h-6 w-px bg-white/10"></div>
        <h1 class="text-white/80 text-sm font-medium tracking-wider uppercase">Workshop Live</h1>
      </div>
      <div class="flex items-center gap-8">
        <!-- Stats -->
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
            </span>
            <span class="text-amber-400 text-sm font-medium">{{ waitingCount }} Waiting</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full bg-blue-400 animate-pulse"></span>
            <span class="text-blue-400 text-sm font-medium">{{ inProgressCount }} In Progress</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
            <span class="text-emerald-400 text-sm font-medium">{{ readyCount }} Ready</span>
          </div>
        </div>
        <div class="h-6 w-px bg-white/10"></div>
        <!-- Clock -->
        <div class="text-right">
          <p class="text-white/90 text-lg font-semibold tabular-nums">{{ currentTime }}</p>
          <p class="text-white/40 text-xs">{{ currentDate }}</p>
        </div>
      </div>
    </header>

    <!-- Job Cards Grid -->
    <main class="flex-1 p-6 overflow-hidden">
      <TransitionGroup
        name="card"
        tag="div"
        class="grid grid-cols-4 gap-5 h-full auto-rows-fr"
      >
        <div
          v-for="job in displayJobs"
          :key="job.id"
          :class="[
            'relative rounded-2xl overflow-hidden flex flex-col transition-all duration-500',
            'bg-gradient-to-br border',
            statusStyles[job.status].card,
          ]"
        >
          <!-- Status accent bar -->
          <div :class="['h-1', statusStyles[job.status].bar]"></div>

          <!-- Card Content -->
          <div class="flex-1 flex flex-col p-5">
            <!-- Top: Plate + Status -->
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="text-white font-bold text-2xl tracking-wider font-mono">{{ job.plate }}</p>
                <p class="text-white/50 text-sm mt-0.5">{{ job.vehicle }}</p>
              </div>
              <span :class="['px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider', statusStyles[job.status].badge]">
                {{ statusStyles[job.status].label }}
              </span>
            </div>

            <!-- Customer -->
            <p class="text-white/70 text-sm mb-4">{{ job.customer }}</p>

            <!-- Services -->
            <div class="flex-1 space-y-1.5 mb-4">
              <div
                v-for="(service, i) in job.services"
                :key="i"
                class="flex items-center gap-2"
              >
                <span :class="['w-1.5 h-1.5 rounded-full shrink-0', statusStyles[job.status].dot]"></span>
                <span class="text-white/60 text-sm truncate">{{ service }}</span>
              </div>
            </div>

            <!-- Bottom: Foreman + Time -->
            <div class="flex items-center justify-between pt-3 border-t border-white/5">
              <div class="flex items-center gap-2">
                <div :class="['w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold', statusStyles[job.status].avatar]">
                  {{ job.foreman.charAt(0) }}
                </div>
                <span class="text-white/50 text-sm">{{ job.foreman }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                <span :class="['text-sm font-medium tabular-nums', job.elapsed > 120 ? 'text-red-400' : 'text-white/40']">
                  {{ formatElapsed(job.elapsed) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Subtle animated shimmer for in-progress -->
          <div
            v-if="job.status === 'progress'"
            class="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
          >
            <div class="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"></div>
          </div>
        </div>
      </TransitionGroup>
    </main>

    <!-- Footer -->
    <footer class="px-8 py-2.5 bg-[#0f1015] border-t border-white/5 flex items-center justify-between">
      <p class="text-white/20 text-xs">Dream Garage (M) Sdn Bhd</p>
      <div class="flex items-center gap-2">
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <p class="text-white/20 text-xs">Live</p>
      </div>
      <p class="text-white/20 text-xs">Page {{ currentPage }} of {{ totalPages }}</p>
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

// ─── Status Styles ────────────────────────────────
const statusStyles: Record<string, { card: string; bar: string; badge: string; dot: string; avatar: string; label: string }> = {
  waiting: {
    card: 'from-amber-950/20 to-[#13141a] border-amber-500/15 hover:border-amber-500/25',
    bar: 'bg-gradient-to-r from-amber-500 to-amber-400',
    badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    dot: 'bg-amber-400',
    avatar: 'bg-amber-500/20 text-amber-400',
    label: 'Waiting',
  },
  progress: {
    card: 'from-blue-950/20 to-[#13141a] border-blue-500/15 hover:border-blue-500/25',
    bar: 'bg-gradient-to-r from-blue-500 to-blue-400',
    badge: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    dot: 'bg-blue-400',
    avatar: 'bg-blue-500/20 text-blue-400',
    label: 'In Progress',
  },
  ready: {
    card: 'from-emerald-950/20 to-[#13141a] border-emerald-500/15 hover:border-emerald-500/25',
    bar: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    dot: 'bg-emerald-400',
    avatar: 'bg-emerald-500/20 text-emerald-400',
    label: 'Ready',
  },
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
  elapsed: number // minutes
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

// ─── Pagination (auto-cycle for overflow) ─────────
const ITEMS_PER_PAGE = 8
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(jobs.value.length / ITEMS_PER_PAGE)))
let pageTimer: ReturnType<typeof setInterval>

const displayJobs = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  return jobs.value.slice(start, start + ITEMS_PER_PAGE)
})

const waitingCount = computed(() => jobs.value.filter(j => j.status === 'waiting').length)
const inProgressCount = computed(() => jobs.value.filter(j => j.status === 'progress').length)
const readyCount = computed(() => jobs.value.filter(j => j.status === 'ready').length)

function formatElapsed(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

// ─── Simulate elapsed time ticking ────────────────
let tickTimer: ReturnType<typeof setInterval>

onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)

  // Auto-cycle pages every 10s if multiple pages
  pageTimer = setInterval(() => {
    if (totalPages.value > 1) {
      currentPage.value = currentPage.value >= totalPages.value ? 1 : currentPage.value + 1
    }
  }, 10000)

  // Tick elapsed time every 60s
  tickTimer = setInterval(() => {
    jobs.value.forEach(j => {
      if (j.status !== 'ready') j.elapsed++
    })
  }, 60000)
})

onUnmounted(() => {
  clearInterval(clockTimer)
  clearInterval(pageTimer)
  clearInterval(tickTimer)
})
</script>

<style>
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 3s ease-in-out infinite;
}

/* Card transition animations */
.card-enter-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.card-leave-active {
  transition: all 0.4s cubic-bezier(0.5, 0, 0.75, 0);
}
.card-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(20px);
}
.card-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(-20px);
}
.card-move {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
