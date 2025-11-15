<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getDefaultRouteForUser } from '@/utils/authRedirect'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const redirectAfterAuth = (maybeUser) => {
  const target = getDefaultRouteForUser(maybeUser ?? authStore.user)

  if (target.name === route.name && route.fullPath === router.resolve(target).fullPath) {
    return
  }

  router.replace(target)
}

const handleLogin = async () => {
  error.value = ''

  // Validation
  if (!email.value || !password.value) {
    error.value = 'Please enter both email and password'
    return
  }

  if (!validateEmail(email.value)) {
    error.value = 'Please enter a valid email address'
    return
  }

  try {
    const response = await authStore.login(email.value, password.value)
    redirectAfterAuth(response?.user)
  } catch (e) {
    error.value = 'Invalid email or password'
  }
}

watch(
  () => (authStore.isAuthenticated ? authStore.user : null),
  (maybeUser) => {
    if (maybeUser && route.name === 'login') {
      redirectAfterAuth(maybeUser)
    }
  },
  { immediate: true }
)

const clearError = () => {
  error.value = ''
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 p-5">
    <!-- Logo and Title -->
    <div class="text-center mb-6">
      <div class="text-6xl mb-2">🌱</div>
      <h1 class="text-4xl font-bold text-white">Touch Grass</h1>
    </div>

    <!-- Login Card -->
    <div class="bg-white rounded-xl shadow-md p-6 w-full max-w-md">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Login</h2>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Email Input -->
        <div>
          <label for="email" class="block text-sm font-semibold text-gray-900 mb-2">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            @input="clearError"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all"
            :disabled="authStore.loading"
          />
        </div>

        <!-- Password Input -->
        <div>
          <label for="password" class="block text-sm font-semibold text-gray-900 mb-2">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            @input="clearError"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all"
            :disabled="authStore.loading"
          />
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm text-center">
          {{ error }}
        </div>

        <!-- Login Button -->
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full bg-primary hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          {{ authStore.loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <!-- Sign Up Link -->
      <div class="mt-6 text-center text-sm">
        <span class="text-gray-600">Don't have an account? </span>
        <router-link to="/signup" class="text-primary font-semibold hover:text-emerald-600 transition-colors">
          Sign up
        </router-link>
      </div>
    </div>
  </div>
</template>
