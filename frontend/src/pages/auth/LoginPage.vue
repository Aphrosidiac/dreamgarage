<template>
  <div class="min-h-screen bg-dark-950 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <img src="/logo-login.png" alt="Dream Garage" class="h-24 mx-auto mb-3" />
        <p class="text-dark-400 text-sm">Staff Login</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-dark-200 mb-1.5">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2.5 text-dark-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
            placeholder="admin@dreamgarage.my"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-dark-200 mb-1.5">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2.5 text-dark-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
            placeholder="Enter your password"
          />
        </div>

        <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-gold-500 text-dark-950 py-2.5 rounded-lg text-sm font-semibold hover:bg-gold-400 transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/app/dashboard')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>
