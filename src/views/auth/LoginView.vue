<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getDefaultRouteForUser } from '@/utils/authRedirect'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'

interface User {
  id: number | string
  email: string
  role: string
  name?: string
  familyCode?: string
  parentId?: string
  kidId?: string
  age?: number
  interests?: string[]
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const redirectAfterAuth = (maybeUser: User | null): void => {
  const target = getDefaultRouteForUser(maybeUser ?? authStore.user)

  // Check if we're already on the target route
  if (
    typeof target === 'object' &&
    'name' in target &&
    target.name === route.name &&
    route.fullPath === router.resolve(target).fullPath
  ) {
    return
  }

  router.replace(target)
}

const handleLogin = async () => {
  error.value = ''

  // Validation
  if (!email.value || !password.value) {
    error.value = 'Enter your email and password'
    return
  }

  if (!validateEmail(email.value)) {
    error.value = 'Enter a valid email address'
    return
  }

  try {
    await authStore.login(email.value, password.value)
    // Wait for Vue reactivity to complete, then redirect
    await nextTick()
    const target = getDefaultRouteForUser(authStore.user)
    await router.push(target)
  } catch (e) {
    error.value = "That email and password don't match an account"
    console.error('Login error:', e)
  }
}

watch(
  () => (authStore.isAuthenticated ? authStore.user : null),
  (maybeUser: User | null) => {
    if (maybeUser && route.name === 'login') {
      redirectAfterAuth(maybeUser)
    }
  },
  { immediate: true },
)

const clearError = () => {
  error.value = ''
}
</script>

<template>
  <AuthLayout>
    <h1 class="text-xl font-semibold text-ink-900">Log in</h1>
    <p class="mt-1 text-base text-ink-500">Parents and kids both sign in here.</p>

    <form class="mt-6 space-y-4" novalidate @submit.prevent="handleLogin">
      <AppField
        v-model="email"
        label="Email"
        type="email"
        autocomplete="email"
        inputmode="email"
        :disabled="authStore.loading"
        @update:model-value="clearError"
      />
      <AppField
        v-model="password"
        label="Password"
        type="password"
        autocomplete="current-password"
        :disabled="authStore.loading"
        @update:model-value="clearError"
      />

      <p
        v-if="error"
        role="alert"
        class="rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700"
      >
        {{ error }}
      </p>

      <AppButton type="submit" block :loading="authStore.loading">
        {{ authStore.loading ? 'Logging in' : 'Log in' }}
      </AppButton>
    </form>

    <template #footer>
      New to Touch Grass?
      <RouterLink
        to="/signup"
        class="font-semibold text-grass-700 transition-colors hover:text-grass-600"
      >
        Create an account
      </RouterLink>
    </template>
  </AuthLayout>
</template>
