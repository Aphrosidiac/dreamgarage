<template>
  <div>
    <!-- Hero Banner -->
    <section class="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div class="absolute inset-0">
        <video autoplay muted loop playsinline class="w-full h-full object-cover">
          <source src="/videos/engine-repair.mp4" type="video/mp4" />
        </video>
        <div class="absolute inset-0 bg-gradient-to-b from-dark-950/80 via-dark-950/70 to-dark-950"></div>
      </div>
      <div class="relative z-10 max-w-4xl mx-auto text-center">
        <p class="text-white/60 font-light text-sm uppercase tracking-[0.4em] mb-6">What We Offer</p>
        <h1 class="font-heading italic text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.05]">
          Our <span class="text-gold-500">Services</span>
        </h1>
      </div>
    </section>

    <!-- Services Grid -->
    <section class="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="grid md:grid-cols-2 gap-6">
          <div
            v-for="service in services"
            :key="service.title"
            class="group bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden hover:border-gold-500/20 transition-all duration-300"
          >
            <!-- Service Image with hover animation -->
            <div class="relative h-52 overflow-hidden">
              <img :src="service.image" :alt="service.title" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
              <div class="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/20 to-transparent"></div>
              <!-- Hover overlay label -->
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span class="bg-gold-500/90 text-dark-950 px-4 py-2 rounded-full text-xs font-heading font-bold uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {{ service.title }}
                </span>
              </div>
            </div>
            <!-- Content -->
            <div class="p-8">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-px h-6 bg-gold-500"></div>
                <h3 class="text-white font-heading font-semibold text-lg tracking-wide">{{ service.title }}</h3>
              </div>
              <p class="text-dark-400 text-sm leading-relaxed pl-4">{{ service.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Process Section -->
    <section class="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-dark-900/50">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-gold-500 font-heading font-medium text-xs uppercase tracking-[0.3em] mb-4">How It Works</p>
          <h2 class="font-heading italic text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">Simple Process</h2>
        </div>
        <div class="grid md:grid-cols-4 gap-8">
          <div v-for="(step, i) in steps" :key="step.title" class="text-center relative">
            <!-- Connector line -->
            <div v-if="i < steps.length - 1" class="hidden md:block absolute top-8 left-[60%] w-[80%] border-t border-dashed border-dark-700"></div>
            <div class="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
              <span class="text-gold-500 font-bold text-lg">{{ String(i + 1).padStart(2, '0') }}</span>
            </div>
            <h4 class="text-white font-semibold mb-2">{{ step.title }}</h4>
            <p class="text-dark-400 text-sm leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="font-heading italic text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
          Need a Service? <span class="text-gold-500">Let's Talk.</span>
        </h2>
        <p class="text-dark-300 text-lg mb-10">
          Reach out via WhatsApp for a quick quote or to book your appointment.
        </p>
        <a
          href="https://wa.me/60182078080"
          target="_blank"
          class="inline-flex bg-gold-500 text-dark-950 px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide hover:bg-gold-400 transition-all duration-200 hover:shadow-[0_0_30px_rgba(255,215,0,0.3)]"
        >
          WhatsApp Us Now
        </a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue'

useHead({
  title: 'Services — Dream Garage (M) Sdn Bhd',
  meta: [
    { name: 'description', content: 'Dream Garage offers tyres & alignment, engine servicing, brake repair, suspension, air-con service, and battery replacement in Johor Bahru. Premium brands including Michelin, Continental, Motul, and Brembo.' },
    { property: 'og:title', content: 'Services — Dream Garage (M) Sdn Bhd' },
    { property: 'og:description', content: 'Tyres & alignment, engine servicing, brake repair, suspension, air-con, and battery replacement in JB.' },
    { property: 'og:url', content: 'https://dreamgarage.my/services' },
  ],
  link: [{ rel: 'canonical', href: 'https://dreamgarage.my/services' }],
})

const services = [
  {
    title: 'Tyres & Alignment',
    image: '/images/bmw-m4-yellow-tyres.jpg',
    desc: 'Supply & fitting, computerized wheel alignment, balancing, rotation, and nitrogen fill for all vehicle types.',
  },
  {
    title: 'General Servicing',
    image: '/images/mechanic-oil-service.jpg',
    desc: 'Routine oil changes, filter replacements, fluid top-ups, and full periodic maintenance to keep your car running smooth.',
  },
  {
    title: 'Engine Diagnostics',
    image: '/images/mercedes-amg-engine-bay.jpg',
    desc: 'Computerized engine scanning, fault code reading, and troubleshooting for all makes and models.',
  },
  {
    title: 'Brake Service',
    image: '/images/porsche-cayman-brake-service.jpg',
    desc: 'Brake pad and disc replacement, brake fluid flush, and full inspection to ensure safe stopping power.',
  },
  {
    title: 'Battery & Electrical',
    image: '/images/mustang-bilstein-shocks.jpg',
    desc: 'Battery testing, replacement, alternator checks, and electrical system diagnostics.',
  },
  {
    title: 'Suspension & Ride',
    image: '/images/bmw-8-series-white.jpg',
    desc: 'Absorber replacement, strut upgrades, bushing work, and ride height adjustments for comfort and handling.',
  },
]

const steps = [
  { title: 'Contact Us', desc: 'Reach out via WhatsApp or call to discuss your needs.' },
  { title: 'Get a Quote', desc: 'We provide a transparent quotation before any work begins.' },
  { title: 'We Service', desc: 'Our technicians carry out the work with quality parts.' },
  { title: 'Drive Away', desc: 'Collect your vehicle in top condition. It\'s that simple.' },
]
</script>
