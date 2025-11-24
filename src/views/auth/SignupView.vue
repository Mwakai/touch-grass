<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getDefaultRouteForUser } from '@/utils/authRedirect'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const selectedRole = ref('')
const name = ref('') // For kid signup
const familyCode = ref('') // For kid signup
const age = ref('') // For kid signup
const error = ref('')
const signupSuccess = ref(false)
const parentFamilyCode = ref('') // To show after parent signup

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const selectRole = (role: string): void => {
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

  // Kid-specific validation
  if (selectedRole.value === 'kid') {
    if (!name.value.trim()) {
      error.value = 'Please enter your name'
      return
    }
    if (!familyCode.value.trim()) {
      error.value = 'Please enter the family code from your parent'
      return
    }
    if (!age.value || parseInt(age.value) < 1 || parseInt(age.value) > 18) {
      error.value = 'Please enter a valid age (1-18)'
      return
    }
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
    const signupData = {
      email: email.value,
      password: password.value,
      role: selectedRole.value,
      ...(selectedRole.value === 'kid' && {
        name: name.value.trim(),
        familyCode: familyCode.value.trim().toUpperCase(),
        age: parseInt(age.value),
      }),
    }

    await authStore.signup(signupData)

    // If parent, show the family code before redirecting
    if (selectedRole.value === 'parent' && authStore.user?.familyCode) {
      parentFamilyCode.value = authStore.user.familyCode
      signupSuccess.value = true
      return // Don't redirect yet, show the family code
    }

    // Wait for Vue reactivity to complete, then redirect
    await nextTick()
    const target = getDefaultRouteForUser(authStore.user)
    await router.push(target)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Signup failed. Please try again.'
    console.error('Signup error:', e)
  }
}

const continueToApp = async () => {
  const target = getDefaultRouteForUser(authStore.user)
  await router.push(target)
}

const clearError = () => {
  error.value = ''
}
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 p-5"
  >
    <!-- Logo and Title -->
    <div class="text-center mb-6">
      <div class="text-6xl mb-2">🌱</div>
      <h1 class="text-4xl font-bold text-white">Touch Grass</h1>
    </div>

    <!-- Success Card for Parent - Show Family Code -->
    <div
      v-if="signupSuccess && parentFamilyCode"
      class="bg-white rounded-xl shadow-md p-6 w-full max-w-md"
    >
      <div class="text-center">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
        <p class="text-gray-600 mb-6">
          Share this family code with your kids so they can join your family:
        </p>

        <div class="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 mb-6">
          <p class="text-sm text-emerald-600 font-medium mb-2">Your Family Code</p>
          <p class="text-3xl font-bold text-emerald-700 tracking-widest">{{ parentFamilyCode }}</p>
        </div>

        <p class="text-sm text-gray-500 mb-6">
          Kids will need this code when they sign up to link to your family.
        </p>

        <button
          @click="continueToApp"
          class="w-full bg-primary hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg transition-all min-h-[44px]"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>

    <!-- Signup Card -->
    <div v-else class="bg-white rounded-xl shadow-md p-6 w-full max-w-md">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Create Account</h2>

      <form @submit.prevent="handleSignup" class="space-y-4">
        <!-- Role Selector -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-3"> I am a... </label>
          <div class="grid grid-cols-2 gap-4">
            <!-- Parent Button -->
            <button
              type="button"
              @click="selectRole('parent')"
              :class="[
                'flex flex-col items-center justify-center p-6 border-2 rounded-lg transition-all min-h-[120px]',
                selectedRole === 'parent'
                  ? 'border-primary bg-emerald-50'
                  : 'border-gray-300 bg-white hover:border-gray-400',
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
                  : 'border-gray-300 bg-white hover:border-gray-400',
              ]"
            >
              <span class="text-4xl mb-2">🧒</span>
              <span class="font-semibold text-gray-900">Kid</span>
            </button>
          </div>
        </div>

        <!-- Kid-specific fields -->
        <template v-if="selectedRole === 'kid'">
          <!-- Name Input -->
          <div>
            <label for="name" class="block text-sm font-semibold text-gray-900 mb-2">
              Your Name
            </label>
            <input
              id="name"
              v-model="name"
              type="text"
              placeholder="What should we call you?"
              @input="clearError"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all"
              :disabled="authStore.loading"
            />
          </div>

          <!-- Age Input -->
          <div>
            <label for="age" class="block text-sm font-semibold text-gray-900 mb-2">
              Your Age
            </label>
            <input
              id="age"
              v-model="age"
              type="number"
              min="1"
              max="18"
              placeholder="How old are you?"
              @input="clearError"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all"
              :disabled="authStore.loading"
            />
          </div>

          <!-- Family Code Input -->
          <div>
            <label for="familyCode" class="block text-sm font-semibold text-gray-900 mb-2">
              Family Code
            </label>
            <input
              id="familyCode"
              v-model="familyCode"
              type="text"
              placeholder="Enter code from your parent"
              @input="clearError"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all uppercase tracking-widest text-center font-mono"
              :disabled="authStore.loading"
              maxlength="10"
            />
            <p class="text-xs text-gray-500 mt-1">Ask your parent for this code</p>
          </div>
        </template>

        <!-- Email Input -->
        <div>
          <label for="email" class="block text-sm font-semibold text-gray-900 mb-2"> Email </label>
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
        <div
          v-if="error"
          class="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm text-center"
        >
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
        <router-link
          to="/login"
          class="text-primary font-semibold hover:text-emerald-600 transition-colors"
        >
          Login
        </router-link>
      </div>
    </div>
  </div>
</template>
