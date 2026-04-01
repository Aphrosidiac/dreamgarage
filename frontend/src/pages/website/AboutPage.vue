<template>
  <div>
    <!-- Hero Banner -->
    <section class="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div class="absolute inset-0">
        <img src="/images/storefront-mercedes-e-black.jpg" alt="Dream Garage storefront" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-b from-dark-950/80 via-dark-950/70 to-dark-950"></div>
      </div>
      <div class="relative z-10 max-w-4xl mx-auto text-center">
        <p class="text-white/60 font-light text-sm uppercase tracking-[0.4em] mb-6">About Us</p>
        <h1 class="font-heading italic text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.05]">
          Dream Garage<br><span class="text-gold-500">(M) Sdn Bhd</span>
        </h1>
      </div>
    </section>

    <!-- Story Section -->
    <section class="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <p class="text-gold-500 font-heading font-medium text-xs uppercase tracking-[0.3em] mb-4">Our Story</p>
          <h2 class="font-heading italic text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Serving JB<br><span class="text-gold-500">Since 2014</span>
          </h2>
          <p class="text-dark-300 text-lg leading-relaxed mb-6">
            Established in 2014, Dream Garage has grown from a small workshop into one of Taman Mount Austin's trusted automotive service centres. We've built our reputation on honest work, transparent pricing, and a genuine passion for cars.
          </p>
          <p class="text-dark-400 leading-relaxed mb-6">
            From daily drivers to high-performance vehicles — Mercedes, BMW, Lexus, Tesla, Nissan GT-R — we treat every car with the same level of care and precision.
          </p>
          <p class="text-dark-400 leading-relaxed">
            Our team combines years of hands-on experience with modern diagnostic tools to deliver quality results every time.
          </p>
        </div>
        <div class="relative rounded-2xl overflow-hidden aspect-[4/5]">
          <img src="/images/storefront-mercedes-cla.jpg" alt="Dream Garage storefront with Mercedes CLA" class="w-full h-full object-cover" />
          <div class="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl"></div>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-dark-900/50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-gold-500 font-heading font-medium text-xs uppercase tracking-[0.3em] mb-4">What Drives Us</p>
          <h2 class="font-heading italic text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">Our Values</h2>
        </div>
        <div class="grid md:grid-cols-3 gap-12 lg:gap-16">
          <div v-for="(value, i) in values" :key="value.title">
            <span class="font-heading font-extrabold italic text-5xl lg:text-6xl text-gold-500/20 leading-none select-none">
              {{ String(i + 1).padStart(2, '0') }}
            </span>
            <h3 class="text-white font-heading font-semibold text-lg tracking-wide mt-4 mb-3">{{ value.title }}</h3>
            <p class="text-dark-400 text-sm leading-relaxed">{{ value.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Brands We Trust -->
    <section class="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div class="relative rounded-2xl overflow-hidden aspect-video">
          <img src="/images/tyre-warehouse-aisle.jpg" alt="Dream Garage tyre warehouse" class="w-full h-full object-cover" />
          <div class="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl"></div>
        </div>
        <div>
          <p class="text-gold-500 font-heading font-medium text-xs uppercase tracking-[0.3em] mb-4">Quality Guaranteed</p>
          <h2 class="font-heading italic text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Only the Best<br><span class="text-gold-500">Brands & Products</span>
          </h2>
          <p class="text-dark-300 text-lg leading-relaxed mb-8">
            We partner with industry-leading brands to ensure every service uses genuine, high-quality parts and products. Your vehicle deserves nothing less.
          </p>
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="(brand, i) in brands"
              :key="brand"
              class="brand-card group relative bg-dark-900 border border-dark-800 rounded-xl py-5 px-4 text-center overflow-hidden cursor-default transition-all duration-300 hover:border-gold-500/40 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,215,0,0.08)]"
              :style="{ animationDelay: `${i * 80}ms` }"
            >
              <!-- Shimmer sweep -->
              <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-gold-500/5 to-transparent"></div>
              <!-- Gold top accent line -->
              <div class="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gold-500 group-hover:w-full transition-all duration-300"></div>
              <span class="relative z-10 text-dark-400 font-heading font-semibold text-xs tracking-widest group-hover:text-gold-500 transition-colors duration-300">{{ brand }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-dark-900/50">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="font-heading italic text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
          Ready to Visit <span class="text-gold-500">Dream Garage?</span>
        </h2>
        <p class="text-dark-300 text-lg mb-10">
          Whether it's a routine service or a complex repair, we're here to help.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://wa.me/60182078080"
            target="_blank"
            class="bg-gold-500 text-dark-950 px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide hover:bg-gold-400 transition-all duration-200 hover:shadow-[0_0_30px_rgba(255,215,0,0.3)]"
          >
            WhatsApp Us
          </a>
          <RouterLink
            to="/contact"
            class="border border-white/20 text-white px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide hover:border-gold-500 hover:text-gold-500 transition-all duration-200"
          >
            Contact & Directions
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

const values = [
  { title: 'Honest Workmanship', desc: 'We believe in doing things right the first time. No shortcuts, no unnecessary upsells — just quality work you can trust.' },
  { title: 'Transparent Pricing', desc: 'You\'ll always know the cost before work begins. We provide clear quotations with no hidden charges or surprises.' },
  { title: 'Customer First', desc: 'Your satisfaction drives everything we do. We take the time to explain, advise, and ensure you\'re confident in every decision.' },
]

const brands = ['MICHELIN', 'MOTUL', 'BREMBO', 'BILSTEIN', 'BMC', 'CONTINENTAL', 'DUNLOP', 'HANKOOK', 'DENSO']
</script>
