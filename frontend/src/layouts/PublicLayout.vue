<template>
  <div class="min-h-screen bg-dark-950">
    <!-- Sticky Header — hides on scroll down, shows on scroll up -->
    <header
      :class="[
        'fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out',
        headerHidden ? '-translate-y-full' : 'translate-y-0',
      ]"
    >
      <nav
        :class="[
          'transition-all duration-300',
          scrolled || mobileOpen ? 'bg-dark-950/95 backdrop-blur-md border-b border-dark-800/50' : 'bg-transparent border-b border-transparent',
        ]"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-20 lg:h-24">
            <!-- Logo -->
            <RouterLink to="/" class="flex items-center">
              <img src="/logo-nav.png" alt="Dream Garage" class="h-16 lg:h-20" />
            </RouterLink>

            <!-- Desktop Nav -->
            <div class="hidden md:flex items-center gap-10">
              <RouterLink
                v-for="link in navLinks"
                :key="link.to"
                :to="link.to"
                :class="[
                  'text-sm font-heading font-semibold tracking-wider uppercase transition-colors duration-200',
                  $route.path === link.to ? 'text-gold-500' : 'text-white/80 hover:text-gold-500',
                ]"
              >
                {{ link.label }}
              </RouterLink>
            </div>

            <!-- CTA + Mobile Toggle -->
            <div class="flex items-center gap-4">
              <a
                href="https://wa.me/60182078080"
                target="_blank"
                class="nav-cta hidden sm:inline-flex items-center gap-2 bg-gold-500 text-dark-950 px-6 py-2.5 rounded-full text-sm font-heading font-semibold tracking-wide relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] hover:scale-105"
              >
                <span class="relative z-10">Get In Touch</span>
                <svg class="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
              <button
                @click="mobileOpen = !mobileOpen"
                class="md:hidden text-white p-2"
                aria-label="Toggle menu"
              >
                <svg v-if="!mobileOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Menu -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="mobileOpen" class="md:hidden bg-dark-950/98 backdrop-blur-md border-t border-dark-800/50">
            <div class="px-6 py-6 space-y-4">
              <RouterLink
                v-for="link in navLinks"
                :key="link.to"
                :to="link.to"
                @click="mobileOpen = false"
                class="block text-sm font-heading font-semibold tracking-wider uppercase text-white/80 hover:text-gold-500 transition-colors py-2"
              >
                {{ link.label }}
              </RouterLink>
              <a
                href="https://wa.me/60182078080"
                target="_blank"
                class="nav-cta flex items-center justify-center gap-2 bg-gold-500 text-dark-950 px-6 py-3 rounded-full text-sm font-heading font-semibold tracking-wide relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] mt-4"
              >
                <span class="relative z-10">Get In Touch</span>
                <svg class="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
            </div>
          </div>
        </transition>
      </nav>
    </header>

    <!-- Content -->
    <main>
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="bg-dark-950 border-t border-dark-800/50">
      <!-- Main Footer -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <!-- Brand -->
          <div class="lg:col-span-1">
            <img src="/logo-nav.png" alt="Dream Garage" class="h-16 mb-6" />
            <p class="text-dark-400 text-sm leading-relaxed">
              Professional automotive services with quality parts from trusted brands since 2014.
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="text-white font-heading font-semibold text-xs uppercase tracking-wider mb-6">Quick Links</h4>
            <ul class="space-y-3">
              <li v-for="link in navLinks" :key="link.to">
                <RouterLink :to="link.to" class="text-dark-400 text-sm hover:text-gold-500 transition-colors">
                  {{ link.label }}
                </RouterLink>
              </li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="text-white font-heading font-semibold text-xs uppercase tracking-wider mb-6">Contact</h4>
            <ul class="space-y-3 text-dark-400 text-sm">
              <li class="flex items-start gap-3">
                <svg class="w-4 h-4 text-gold-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>22, Jalan Mutiara Emas 5/1,<br>Taman Mount Austin,<br>81100 Johor Bahru, Johor</span>
              </li>
              <li>
                <a href="tel:+60182078080" class="flex items-center gap-3 hover:text-gold-500 transition-colors">
                  <svg class="w-4 h-4 text-gold-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  +60 18-207 8080
                </a>
              </li>
              <li>
                <a href="https://wa.me/60182078080" target="_blank" class="flex items-center gap-3 hover:text-gold-500 transition-colors">
                  <svg class="w-4 h-4 text-gold-500 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <!-- Hours -->
          <div>
            <h4 class="text-white font-heading font-semibold text-xs uppercase tracking-wider mb-6">Operating Hours</h4>
            <ul class="space-y-3 text-dark-400 text-sm">
              <li class="flex justify-between">
                <span>Monday - Saturday</span>
                <span class="text-white">9:00 AM - 6:00 PM</span>
              </li>
              <li class="flex justify-between">
                <span>Sunday</span>
                <span class="text-gold-500">Closed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-dark-800/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-dark-500 text-xs">
            &copy; {{ new Date().getFullYear() }} Dream Garage (M) Sdn Bhd. All Rights Reserved.
          </p>
          <a href="https://app.dreamgarage.my/login" class="text-dark-600 hover:text-dark-400 transition-colors text-xs">
            Staff Login
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

import { RouterLink, RouterView } from 'vue-router'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
]

// Header hide/show on scroll
const headerHidden = ref(false)
const scrolled = ref(false)
const mobileOpen = ref(false)

let lastScrollY = 0
let ticking = false

function onScroll() {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const currentScrollY = window.scrollY

      scrolled.value = currentScrollY > 50
      headerHidden.value = currentScrollY > lastScrollY && currentScrollY > 200

      lastScrollY = currentScrollY
      ticking = false
    })
    ticking = true
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
/* Shimmer sweep across button */
.nav-cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  transition: none;
  animation: shimmer 3s ease-in-out infinite;
}

.nav-cta:hover::before {
  animation: shimmer-fast 0.6s ease-out;
}

/* Arrow slides right on hover */
.nav-cta:hover svg {
  transform: translateX(4px);
}

.nav-cta svg {
  transition: transform 0.3s ease;
}

@keyframes shimmer {
  0%, 100% { left: -100%; }
  50% { left: 120%; }
}

@keyframes shimmer-fast {
  from { left: -100%; }
  to { left: 120%; }
}
</style>
