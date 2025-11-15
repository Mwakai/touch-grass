<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getDefaultRouteForUser } from '@/utils/authRedirect'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const selectedRole = ref('')
const error = ref('')

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const selectRole = (role) => {
  selectedRole.value = role
  clearError()
}

const handleSignup = async () => {
  error.value = ''

  // Validation
  if (!selectedRole.value) {
    error.value = 'Please select a role (Parent or Kid)'
    return
  }

  if (!email.value || !password.value || !confirmPassword.value) {
    error.value = 'Please fill in all fields'
    return
  }

  if (!validateEmail(email.value)) {
    error.value = 'Please enter a valid email address'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  try {
    const response = await authStore.signup(email.value, password.value, selectedRole.value)
    router.push(getDefaultRouteForUser(response?.user ?? authStore.user))
  } catch (e) {
    error.value = 'Signup failed. Please try again.'
  }
}

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

    <!-- Signup Card -->
    <div class="bg-white rounded-xl shadow-md p-6 w-full max-w-md">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Create Account</h2>

      <form @submit.prevent="handleSignup" class="space-y-4">
        <!-- Role Selector -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-3">
            I am a...
          </label>
          <div class="grid grid-cols-2 gap-4">
            <!-- Parent Button -->
            <button
              type="button"
              @click="selectRole('parent')"
              :class="[
                'flex flex-col items-center justify-center p-6 border-2 rounded-lg transition-all min-h-[120px]',
                selectedRole === 'parent'
                  ? 'border-primary bg-emerald-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              ]"
            >
              <span class="text-4xl mb-2">👨‍👩‍👧‍👦</span>
              <span class="font-semibold text-gray-900">Parent</span>
            </button>

            <!-- Kid Button -->
            <button
              type="button"
              @click="selectRole('kid')"
              :class="[
                'flex flex-col items-center justify-center p-6 border-2 rounded-lg transition-all min-h-[120px]',
                selectedRole === 'kid'
                  ? 'border-primary bg-emerald-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              ]"
            >
              <span class="text-4xl mb-2">🧒</span>
              <span class="font-semibold text-gray-900">Kid</span>
            </button>
          </div>
        </div>

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
            placeholder="At least 6 characters"
            @input="clearError"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all"
            :disabled="authStore.loading"
          />
        </div>

        <!-- Confirm Password Input -->
        <div>
          <label for="confirmPassword" class="block text-sm font-semibold text-gray-900 mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            @input="clearError"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all"
            :disabled="authStore.loading"
          />
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm text-center">
          {{ error }}
        </div>

        <!-- Sign Up Button -->
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full bg-primary hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          {{ authStore.loading ? 'Creating account...' : 'Sign Up' }}
        </button>
      </form>

      <!-- Login Link -->
      <div class="mt-6 text-center text-sm">
        <span class="text-gray-600">Already have an account? </span>
        <router-link to="/login" class="text-primary font-semibold hover:text-emerald-600 transition-colors">
          Login
        </router-link>
      </div>
    </div>
  </div>
</template>
