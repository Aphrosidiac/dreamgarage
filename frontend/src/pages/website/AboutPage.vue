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
              v-for="brand in brands"
              :key="brand.name"
              class="relative"
              @mouseenter="activeBrand = brand.name"
              @mouseleave="activeBrand = ''; tiltX = 0; tiltY = 0"
              @mousemove="handleTilt"
            >
              <div
                :class="[
                  'relative bg-dark-900 border rounded-xl py-5 px-4 text-center cursor-pointer transition-all duration-300',
                  activeBrand === brand.name ? 'border-gold-500/50 -translate-y-1 shadow-[0_8px_30px_rgba(255,215,0,0.12)]' : 'border-dark-800 hover:border-dark-700',
                ]"
              >
                <span :class="['font-heading font-semibold text-xs tracking-widest transition-colors duration-300', activeBrand === brand.name ? 'text-gold-500' : 'text-dark-400']">{{ brand.name }}</span>
              </div>
              <!-- 3D Product Popup -->
              <Transition name="brand-popup">
                <div
                  v-if="activeBrand === brand.name && brand.image"
                  class="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-3 pointer-events-none"
                >
                  <div
                    class="w-72 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(255,215,0,0.08)] border border-white/10"
                    :style="{
                      transform: `perspective(800px) rotateY(${tiltX}deg) rotateX(${-tiltY}deg) scale(1)`,
                      transition: 'transform 0.15s ease-out',
                    }"
                  >
                    <img :src="brand.image" :alt="brand.name + ' product'" class="w-full h-44 object-cover" />
                    <div class="bg-dark-950/95 backdrop-blur-sm px-4 py-2.5 border-t border-white/5">
                      <p class="text-gold-500 font-heading font-bold text-xs tracking-wider">{{ brand.name }}</p>
                      <p class="text-dark-400 text-[11px] mt-0.5">{{ brand.tagline }}</p>
                    </div>
                  </div>
                  <!-- Arrow -->
                  <div class="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-dark-950/95 border-r border-b border-white/10 rotate-45"></div>
                </div>
              </Transition>
              <!-- Promo CTA Popup (for brands without image) -->
              <Transition name="brand-popup">
                <div
                  v-if="activeBrand === brand.name && !brand.image"
                  class="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-3"
                >
                  <div
                    class="w-72 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(255,215,0,0.08)] border border-gold-500/20"
                    :style="{
                      transform: `perspective(800px) rotateY(${tiltX}deg) rotateX(${-tiltY}deg) scale(1)`,
                      transition: 'transform 0.15s ease-out',
                    }"
                  >
                    <div class="bg-gradient-to-br from-dark-950 to-dark-900 px-5 py-6 text-center">
                      <p class="text-gold-500 font-heading font-bold text-sm tracking-wider mb-2">Want to know more?</p>
                      <p class="text-dark-300 text-xs leading-relaxed mb-4">Visit us at Taman Mount Austin or WhatsApp us to explore our full range of brands and products.</p>
                      <a href="https://wa.me/60182078080" target="_blank" class="inline-flex items-center gap-1.5 bg-gold-500 text-dark-950 px-4 py-2 rounded-full text-xs font-bold tracking-wide hover:bg-gold-400 transition-colors pointer-events-auto">
                        WhatsApp Us
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </a>
                    </div>
                  </div>
                  <div class="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-dark-950 border-r border-b border-gold-500/20 rotate-45"></div>
                </div>
              </Transition>
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
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'

useHead({
  title: 'About Us — Dream Garage (M) Sdn Bhd',
  meta: [
    { name: 'description', content: 'Established in 2014, Dream Garage has been providing quality automotive services to the Johor Bahru community. Honest workmanship, transparent pricing, and a passion for cars.' },
    { property: 'og:title', content: 'About Us — Dream Garage (M) Sdn Bhd' },
    { property: 'og:description', content: 'Established in 2014, Dream Garage has been providing quality automotive services to the Johor Bahru community.' },
    { property: 'og:url', content: 'https://dreamgarage.my/about' },
  ],
  link: [{ rel: 'canonical', href: 'https://dreamgarage.my/about' }],
})

const values = [
  { title: 'Honest Workmanship', desc: 'We believe in doing things right the first time. No shortcuts, no unnecessary upsells — just quality work you can trust.' },
  { title: 'Transparent Pricing', desc: 'You\'ll always know the cost before work begins. We provide clear quotations with no hidden charges or surprises.' },
  { title: 'Customer First', desc: 'Your satisfaction drives everything we do. We take the time to explain, advise, and ensure you\'re confident in every decision.' },
]

const brands = [
  { name: 'MICHELIN', image: '/images/brands/products/michelin.jpg', tagline: 'Premium Performance Tyres' },
  { name: 'MOTUL', image: '/images/brands/products/motul.jpg', tagline: 'High-Performance Engine Oil' },
  { name: 'BREMBO', image: '/images/brands/products/brembo.jpg', tagline: 'Racing Brake Systems' },
  { name: 'BILSTEIN', image: '/images/brands/products/bilstein.jpg', tagline: 'Precision Shock Absorbers' },
  { name: 'MORE', image: '', tagline: '' },
  { name: 'CONTINENTAL', image: '/images/brands/products/continental.jpg', tagline: 'German-Engineered Tyres' },
  { name: 'DUNLOP', image: '/images/brands/products/dunlop.jpg', tagline: 'Trusted Tyre Technology' },
  { name: 'HANKOOK', image: '/images/brands/products/hankook.jpg', tagline: 'Track-Ready Tyre Performance' },
  { name: 'DENSO', image: '/images/brands/products/denso.jpg', tagline: 'OEM Electrical Components' },
]

const activeBrand = ref('')
const tiltX = ref(0)
const tiltY = ref(0)

function handleTilt(e: MouseEvent) {
  const el = (e.currentTarget as HTMLElement)
  const rect = el.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  tiltX.value = x * 15
  tiltY.value = y * 10
}
</script>

<style scoped>
.brand-popup-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.brand-popup-leave-active {
  transition: all 0.15s ease-in;
}
.brand-popup-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(8px) scale(0.9);
}
.brand-popup-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px) scale(0.95);
}
</style>
