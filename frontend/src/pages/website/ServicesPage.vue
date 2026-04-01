<template>
  <div>
    <!-- Hero Banner -->
    <section class="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div class="absolute inset-0">
        <video autoplay muted loop playsinline class="w-full h-full object-cover">
          <source src="/videos/mechanic-underhood.mp4" type="video/mp4" />
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
            <!-- Service Image -->
            <div class="relative h-52 overflow-hidden">
              <img :src="service.image" :alt="service.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div class="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/20 to-transparent"></div>
            </div>
            <!-- Content -->
            <div class="p-8">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-px h-6 bg-gold-500"></div>
                <h3 class="text-white font-heading font-semibold text-lg tracking-wide">{{ service.title }}</h3>
              </div>
              <p class="text-dark-400 text-sm leading-relaxed mb-6 pl-4">{{ service.desc }}</p>
              <ul class="space-y-2.5 pl-4">
                <li v-for="item in service.includes" :key="item" class="flex items-center gap-3 text-dark-300 text-sm">
                  <svg class="w-3.5 h-3.5 text-gold-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  {{ item }}
                </li>
              </ul>
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
const services = [
  {
    title: 'Tyres & Alignment',
    desc: 'Wide selection of premium tyres with professional fitting, computerized alignment, and balancing.',
    image: '/images/bmw-m4-yellow-tyres.jpg',
    includes: ['Tyre replacement & fitting', 'Computerized wheel alignment', 'Wheel balancing', 'Tyre pressure monitoring'],
  },
  {
    title: 'General Servicing',
    desc: 'Comprehensive vehicle maintenance to keep your car running at its best.',
    image: '/images/mechanic-oil-service.jpg',
    includes: ['Engine oil & filter change', 'Multi-point inspection', 'Fluid top-up & replacement', 'Spark plug replacement'],
  },
  {
    title: 'Engine Diagnostics',
    desc: 'Advanced computerized diagnostics to identify and resolve engine issues accurately.',
    image: '/images/mercedes-amg-engine-bay.jpg',
    includes: ['OBD fault code scanning', 'Engine performance analysis', 'Sensor & component testing', 'Check engine light diagnosis'],
  },
  {
    title: 'Brake Service',
    desc: 'Complete brake system maintenance for your safety on the road.',
    image: '/images/porsche-cayman-brake-service.jpg',
    includes: ['Brake pad replacement', 'Disc rotor inspection & resurfacing', 'Brake fluid change', 'Brake line inspection'],
  },
  {
    title: 'Battery & Electrical',
    desc: 'Battery testing, replacement, and full electrical system diagnostics.',
    image: '/images/mustang-bilstein-shocks.jpg',
    includes: ['Battery health testing', 'Battery replacement', 'Alternator & starter check', 'Electrical fault diagnosis'],
  },
  {
    title: 'Air-Con Service',
    desc: 'Keep your cabin cool with professional air conditioning servicing.',
    image: '/images/bmw-8-series-white.jpg',
    includes: ['A/C gas top-up & recharge', 'Compressor inspection', 'Cabin filter replacement', 'Cooling performance test'],
  },
]

const steps = [
  { title: 'Contact Us', desc: 'Reach out via WhatsApp or call to discuss your needs.' },
  { title: 'Get a Quote', desc: 'We provide a transparent quotation before any work begins.' },
  { title: 'We Service', desc: 'Our technicians carry out the work with quality parts.' },
  { title: 'Drive Away', desc: 'Collect your vehicle in top condition. It\'s that simple.' },
]
</script>
