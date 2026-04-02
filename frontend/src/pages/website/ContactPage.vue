<template>
  <div>
    <!-- Hero Banner -->
    <section class="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div class="absolute inset-0">
        <img src="/images/storefront-bmw-5-series.jpg" alt="Dream Garage storefront" class="w-full h-full object-cover" style="object-position: center 40%;" />
        <div class="absolute inset-0 bg-gradient-to-b from-dark-950/80 via-dark-950/70 to-dark-950"></div>
      </div>
      <div class="relative z-10 max-w-4xl mx-auto text-center">
        <p class="text-white/60 font-light text-sm uppercase tracking-[0.4em] mb-6">Get In Touch</p>
        <h1 class="font-heading italic text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.05]">
          Contact <span class="text-gold-500">Us</span>
        </h1>
      </div>
    </section>

    <!-- Contact Cards + Map -->
    <section class="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <!-- Contact Info -->
          <div>
            <p class="text-gold-500 font-heading font-medium text-xs uppercase tracking-[0.3em] mb-4">Reach Out</p>
            <h2 class="font-heading italic text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-10">
              We'd Love to<br><span class="text-gold-500">Hear From You</span>
            </h2>

            <div class="space-y-8">
              <!-- Address -->
              <div>
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-px h-5 bg-gold-500"></div>
                  <h4 class="text-white font-heading font-semibold text-sm tracking-wide">Address</h4>
                </div>
                <p class="text-dark-400 text-sm leading-relaxed pl-4">
                  22, Jalan Mutiara Emas 5/1,<br>
                  Taman Mount Austin,<br>
                  81100 Johor Bahru, Johor
                </p>
                <div class="flex gap-3 mt-3 pl-4">
                  <a href="https://waze.com/ul?ll=1.5474854,103.7730085&navigate=yes" target="_blank" class="text-gold-500 text-xs font-heading font-semibold uppercase tracking-wider hover:text-gold-400 transition-colors">Waze</a>
                  <span class="text-dark-700">|</span>
                  <a href="https://maps.app.goo.gl/edjL5wT3tBoiH7Yr5" target="_blank" class="text-gold-500 text-xs font-heading font-semibold uppercase tracking-wider hover:text-gold-400 transition-colors">Google Maps</a>
                </div>
              </div>

              <!-- Phone -->
              <div>
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-px h-5 bg-gold-500"></div>
                  <h4 class="text-white font-heading font-semibold text-sm tracking-wide">Phone</h4>
                </div>
                <a href="tel:+60182078080" class="text-dark-400 text-sm pl-4 hover:text-gold-500 transition-colors">+60 18-207 8080</a>
              </div>

              <!-- WhatsApp -->
              <div>
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-px h-5 bg-gold-500"></div>
                  <h4 class="text-white font-heading font-semibold text-sm tracking-wide">WhatsApp</h4>
                </div>
                <a href="https://wa.me/60182078080" target="_blank" class="text-dark-400 text-sm pl-4 hover:text-gold-500 transition-colors">+60 18-207 8080</a>
                <p class="text-dark-600 text-xs pl-4 mt-1">Fastest way to reach us</p>
              </div>

              <!-- Hours -->
              <div>
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-px h-5 bg-gold-500"></div>
                  <h4 class="text-white font-heading font-semibold text-sm tracking-wide">Operating Hours</h4>
                </div>
                <div class="space-y-1 text-sm pl-4">
                  <div class="flex justify-between gap-8">
                    <span class="text-dark-400">Monday - Saturday</span>
                    <span class="text-white">9:00 AM - 6:00 PM</span>
                  </div>
                  <div class="flex justify-between gap-8">
                    <span class="text-dark-400">Sunday</span>
                    <span class="text-gold-500">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Map -->
          <div class="flex flex-col gap-6">
            <div class="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden flex-1 min-h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.4!2d103.7704336!3d1.5474854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da6e3e5a204b47%3A0x1a301196dd7f8f21!2sDream%20Garage!5e0!3m2!1sen!2smy!4v1"
                class="w-full h-full border-0 min-h-[400px]"
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
            <!-- Quick info card -->
            <div class="bg-dark-900 border border-dark-800 rounded-2xl p-6">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-px h-5 bg-gold-500"></div>
                <p class="text-white font-heading font-semibold text-sm tracking-wide">Walk-ins Welcome</p>
              </div>
              <p class="text-dark-400 text-xs pl-4">No appointment needed for most services. Just drive in!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
