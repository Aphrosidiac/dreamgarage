<template>
  <div>
    <!-- ═══════════════ HERO — Video Background ═══════════════ -->
    <section class="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      <!-- Video BG -->
      <video
        autoplay
        muted
        loop
        playsinline
        class="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/engine-closeup.mp4" type="video/mp4" />
      </video>
      <!-- Overlay -->
      <div class="absolute inset-0 bg-gradient-to-b from-dark-950/80 via-dark-950/60 to-dark-950"></div>

      <!-- Hero Content -->
      <div class="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <p class="text-white/70 font-heading font-light text-sm uppercase tracking-[0.4em] mb-6 animate-fade-in-up">
          Dream Garage (M) Sdn Bhd
        </p>
        <h1 class="font-heading italic text-5xl sm:text-6xl lg:text-8xl font-extrabold text-white leading-[1.05] animate-fade-in-up animation-delay-100">
          Your Trusted<br>
          <span class="text-gold-500">Car Workshop</span>
        </h1>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg class="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>

    <!-- ═══════════════ PASSION FOR PERFECTION — About Intro ═══════════════ -->
    <section class="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <!-- Text -->
        <div>
          <p class="text-gold-500 font-heading font-medium text-xs uppercase tracking-[0.3em] mb-4">About Us</p>
          <h2 class="font-heading italic text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            A Passion for<br><span class="text-gold-500">Perfection</span>
          </h2>
          <p class="text-dark-300 text-lg leading-relaxed mb-6">
            Established in 2014, Dream Garage has been providing quality automotive services to the Johor Bahru community. Located in Taman Mount Austin, we specialize in tyre services, general maintenance, and repair work for all vehicle types.
          </p>
          <p class="text-dark-400 leading-relaxed mb-8">
            We work with trusted brands including Michelin, Continental, Dunlop, Hankook, Mobil 1, and Motul to ensure your vehicle gets only the best parts and products.
          </p>
          <RouterLink
            to="/about"
            class="inline-flex items-center gap-2 text-gold-500 font-semibold text-sm uppercase tracking-wider hover:gap-4 transition-all duration-200"
          >
            Discover More
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </RouterLink>
        </div>
        <!-- Image -->
        <div class="relative rounded-2xl overflow-hidden aspect-square">
          <img src="/images/mechanic-oil-service.jpg" alt="Dream Garage engine bay service" class="w-full h-full object-cover scale-150 object-[30%_60%]" />
          <div class="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl"></div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ SERVICES GRID ═══════════════ -->
    <section class="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-dark-900/50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-gold-500 font-heading font-medium text-xs uppercase tracking-[0.3em] mb-4">What We Offer</p>
          <h2 class="font-heading italic text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">Our Services</h2>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-dark-800/50 rounded-2xl overflow-hidden">
          <div
            v-for="service in services"
            :key="service.title"
            class="group bg-dark-950 p-8 lg:p-10 hover:bg-dark-900/80 transition-all duration-300 relative"
          >
            <div class="flex items-center gap-4 mb-4">
              <div class="w-px h-8 bg-gold-500"></div>
              <h3 class="text-white font-heading font-semibold text-base tracking-wide">{{ service.title }}</h3>
            </div>
            <p class="text-dark-400 text-sm leading-relaxed pl-5">{{ service.desc }}</p>
          </div>
        </div>
        <div class="text-center mt-12">
          <RouterLink
            to="/services"
            class="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide hover:border-gold-500 hover:text-gold-500 transition-all duration-200"
          >
            View All Services
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ═══════════════ BRANDS CAROUSEL ═══════════════ -->
    <section class="py-16 border-y border-dark-800/50 overflow-hidden">
      <p class="text-center text-dark-500 text-xs font-heading uppercase tracking-[0.3em] mb-10">Trusted Brands We Work With</p>
      <div class="brand-carousel">
        <div class="brand-track">
          <img
            v-for="logo in [...brandLogos, ...brandLogos]"
            :key="logo.name + Math.random()"
            :src="logo.src"
            :alt="logo.name"
            class="brand-logo h-10 sm:h-12 w-auto object-contain mx-10 sm:mx-14 shrink-0"
          />
        </div>
      </div>
    </section>

    <!-- ═══════════════ WHY CHOOSE US ═══════════════ -->
    <section class="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <!-- Image -->
        <div class="relative rounded-2xl overflow-hidden aspect-video order-2 lg:order-1">
          <img src="/images/storefront-porsche-taycan.jpg" alt="Porsche Taycan at Dream Garage" class="w-full h-full object-cover" />
          <div class="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl"></div>
        </div>
        <!-- Content -->
        <div class="order-1 lg:order-2">
          <p class="text-gold-500 font-heading font-medium text-xs uppercase tracking-[0.3em] mb-4">Why Dream Garage</p>
          <h2 class="font-heading italic text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-10">
            Dedication for<br><span class="text-gold-500">Over a Decade</span>
          </h2>
          <div class="space-y-8">
            <div v-for="(feature, i) in features" :key="feature.title" class="flex gap-6 items-start">
              <span class="font-heading font-extrabold italic text-4xl lg:text-5xl text-gold-500/20 leading-none shrink-0 select-none">
                {{ String(i + 1).padStart(2, '0') }}
              </span>
              <div class="pt-1">
                <h4 class="text-white font-heading font-semibold text-base tracking-wide mb-1">{{ feature.title }}</h4>
                <p class="text-dark-400 text-sm leading-relaxed">{{ feature.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ GALLERY ═══════════════ -->
    <section class="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-gold-500 font-heading font-medium text-xs uppercase tracking-[0.3em] mb-4">Our Work</p>
          <h2 class="font-heading italic text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">From Our Workshop</h2>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="(img, i) in gallery"
            :key="img.src"
            :class="[
              'relative rounded-2xl overflow-hidden group cursor-pointer',
              i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square',
            ]"
          >
            <img :src="img.src" :alt="img.alt" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute inset-0 bg-gradient-to-t from-dark-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p class="text-white text-sm font-medium">{{ img.alt }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ CTA BANNER ═══════════════ -->
    <section class="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <!-- Video BG -->
      <video autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover">
        <source src="/videos/wheel-removal.mp4" type="video/mp4" />
      </video>
      <div class="absolute inset-0 bg-dark-950/85"></div>

      <div class="relative z-10 max-w-3xl mx-auto text-center">
        <h2 class="font-heading italic text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
          Ready to Experience<br><span class="text-gold-500">Quality Service?</span>
        </h2>
        <p class="text-dark-300 text-lg mb-10 max-w-xl mx-auto">
          Drop by our workshop or reach out via WhatsApp. We're here to keep your vehicle in its best shape.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://wa.me/60182078080"
            target="_blank"
            class="bg-gold-500 text-dark-950 px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide hover:bg-gold-400 transition-all duration-200 hover:shadow-[0_0_30px_rgba(255,215,0,0.3)]"
          >
            WhatsApp Us Now
          </a>
          <RouterLink
            to="/contact"
            class="border border-white/20 text-white px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide hover:border-gold-500 hover:text-gold-500 transition-all duration-200"
          >
            Get Directions
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ═══════════════ READY TO VISIT ═══════════════ -->
    <section class="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-dark-900/50">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-gold-500 font-heading font-medium text-xs uppercase tracking-[0.3em] mb-4">Before You Come</p>
          <h2 class="font-heading italic text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">Ready to Visit?</h2>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="(tip, i) in visitTips" :key="tip.title" class="text-center group">
            <div class="w-20 h-20 bg-gold-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gold-500/20 transition-colors duration-300">
              <span class="text-gold-500 text-3xl font-bold">{{ String(i + 1).padStart(2, '0') }}</span>
            </div>
            <h4 class="text-white font-heading font-semibold text-lg mb-3">{{ tip.title }}</h4>
            <p class="text-dark-400 text-sm leading-relaxed">{{ tip.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ LOCATION ═══════════════ -->
    <section class="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-gold-500 font-heading font-medium text-xs uppercase tracking-[0.3em] mb-4">Find Us</p>
          <h2 class="font-heading italic text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">Visit Our Workshop</h2>
          <p class="text-dark-400 text-lg">22, Jalan Mutiara Emas 5/1, Taman Mount Austin, 81100 Johor Bahru, Johor</p>
        </div>
        <div class="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden h-96">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.4!2d103.7704336!3d1.5474854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da6e3e5a204b47%3A0x1a301196dd7f8f21!2sDream%20Garage!5e0!3m2!1sen!2smy!4v1"
            class="w-full h-full border-0"
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Dream Garage (M) Sdn Bhd — Trusted Car Workshop in Johor Bahru',
  meta: [
    { name: 'description', content: 'Dream Garage is a trusted car workshop in Taman Mount Austin, Johor Bahru. Specializing in tyres, wheel alignment, engine servicing, brake repair, and more since 2014.' },
    { property: 'og:title', content: 'Dream Garage (M) Sdn Bhd — Trusted Car Workshop in Johor Bahru' },
    { property: 'og:description', content: 'Your trusted car workshop in JB — tyres, wheel alignment, engine servicing, brake repair, and more since 2014.' },
    { property: 'og:url', content: 'https://dreamgarage.my/' },
  ],
  link: [{ rel: 'canonical', href: 'https://dreamgarage.my/' }],
})

const visitTips = [
  { title: 'No Appointment Needed', desc: 'Just drive in during our operating hours. Walk-ins are welcome for most services.' },
  { title: 'Know Your Vehicle', desc: 'Have your vehicle plate number and any previous service records ready for a smoother experience.' },
  { title: 'We Handle The Rest', desc: 'Our experienced foremen will assess your vehicle, provide a transparent quote, and get the job done right.' },
]

const brandLogos = [
  { name: 'Michelin', src: '/images/brands/michelin.png' },
  { name: 'Motul', src: '/images/brands/motul.png' },
  { name: 'Brembo', src: '/images/brands/brembo.svg' },
  { name: 'Bilstein', src: '/images/brands/bilstein.png' },
  { name: 'Continental', src: '/images/brands/continental.png' },
  { name: 'Dunlop', src: '/images/brands/dunlop.svg' },
  { name: 'Hankook', src: '/images/brands/hankook.png' },
]

const services = [
  { title: 'Tyres & Alignment', desc: 'Premium tyres from top brands with professional fitting, alignment, and balancing for a smooth, safe ride.' },
  { title: 'General Servicing', desc: 'Regular maintenance including oil change, filter replacement, and comprehensive multi-point vehicle inspection.' },
  { title: 'Battery & Electrical', desc: 'Battery testing, charging, and replacement. Full electrical system diagnostics for all vehicle makes.' },
  { title: 'Air-Con Service', desc: 'Air conditioning inspection, gas top-up, compressor checks, and complete A/C system servicing.' },
  { title: 'Brake Service', desc: 'Brake pad replacement, disc inspection, fluid change, and complete brake system maintenance.' },
  { title: 'Engine Diagnostics', desc: 'Computerized engine diagnostics, fault code reading, and performance tuning for all vehicle types.' },
]

const gallery = [
  { src: '/images/porsche-gt3-yellow-rear.jpg', alt: 'Porsche 911 GT3' },
  { src: '/images/storefront-mercedes-e-black.jpg', alt: 'Mercedes E-Class at Dream Garage' },
  { src: '/images/bmw-8-series-white.jpg', alt: 'BMW 8 Series Gran Coupe' },
  { src: '/images/porsche-cayman-brake-service.jpg', alt: 'Porsche Cayman Brake Service' },
  { src: '/images/bmw-m4-yellow-tyres.jpg', alt: 'BMW M4 Tyre Service' },
  { src: '/images/storefront-porsche-taycan.jpg', alt: 'Porsche Taycan at Dream Garage' },
  { src: '/images/alphard-custom-wheels.jpg', alt: 'Toyota Alphard Tyre Service' },
  { src: '/images/mustang-bilstein-shocks.jpg', alt: 'Ford Mustang Suspension Upgrade' },
  { src: '/images/storefront-bmw-5-series.jpg', alt: 'BMW 5 Series at Dream Garage' },
]

const features = [
  { title: 'Experienced Technicians', desc: 'Our skilled team brings years of hands-on experience across all vehicle makes and models.' },
  { title: 'Genuine Parts & Products', desc: 'We only use quality parts from trusted brands — Michelin, Continental, Mobil 1, Motul, and more.' },
  { title: 'Transparent Pricing', desc: 'No hidden charges. We provide clear quotations before any work begins on your vehicle.' },
  { title: 'Serving JB Since 2014', desc: 'Over a decade of trusted service to the Taman Mount Austin and greater Johor Bahru community.' },
]
</script>

<style scoped>
/* Brand logos */
.brand-logo {
  transition: opacity 0.3s ease;
}
.brand-logo:hover {
  opacity: 0.8;
}

/* Infinite brand carousel */
.brand-carousel {
  width: 100%;
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
}

.brand-track {
  display: flex;
  align-items: center;
  width: max-content;
  animation: scroll-brands 25s linear infinite;
}

@keyframes scroll-brands {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out both;
}

.animation-delay-100 {
  animation-delay: 0.1s;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-300 {
  animation-delay: 0.3s;
}
</style>
