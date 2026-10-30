<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User as UserIcon, Users } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { getDefaultRouteForUser } from '@/utils/authRedirect'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'

interface User {
  id: number | string
  email?: string
  role: string
  name?: string
  familyCode?: string
  parentId?: string
  kidId?: string
  age?: number
  interests?: string[]
}

type Mode = 'parent' | 'kid'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const modes = [
  { id: 'parent', label: 'Parent', icon: Users },
  { id: 'kid', label: 'Kid', icon: UserIcon },
] as const

const mode = ref<Mode>('parent')
const email = ref('')
const password = ref('')
const familyCode = ref('')
const username = ref('')
const pin = ref('')
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

const selectMode = (next: Mode) => {
  mode.value = next
  clearError()
}

const loginAsParent = async () => {
  if (!email.value || !password.value) {
    error.value = 'Enter your email and password'
    return false
  }

  if (!validateEmail(email.value)) {
    error.value = 'Enter a valid email address'
    return false
  }

  try {
    await authStore.login(email.value, password.value)
    return true
  } catch (e) {
    error.value = "That email and password don't match an account"
    console.error('Login error:', e)
    return false
  }
}

const loginAsKid = async () => {
  if (!familyCode.value.trim() || !username.value.trim() || !pin.value) {
    error.value = 'Enter your family code, username and PIN'
    return false
  }

  if (!/^\d{4}$/.test(pin.value)) {
    error.value = 'Your PIN is 4 numbers'
    return false
  }

  try {
    await authStore.kidLogin(
      familyCode.value.trim().toUpperCase(),
      username.value.trim(),
      pin.value,
    )
    return true
  } catch (e) {
    // The server's message covers wrong details and a locked login
    error.value = e instanceof Error ? e.message : 'Could not log you in. Please try again.'
    console.error('Kid login error:', e)
    return false
  }
}

const handleLogin = async () => {
  error.value = ''

  const loggedIn = mode.value === 'kid' ? await loginAsKid() : await loginAsParent()
  if (!loggedIn) return

  // Wait for Vue reactivity to complete, then redirect
  await nextTick()
  await router.push(getDefaultRouteForUser(authStore.user))
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
    <p class="mt-1 text-base text-ink-500">
      {{
        mode === 'kid'
          ? 'Use the username and PIN your grown-up made for you.'
          : 'Log in with the email you signed up with.'
      }}
    </p>

    <div class="mt-6 grid grid-cols-2 gap-1 rounded-md bg-ink-100 p-1" role="tablist">
      <button
        v-for="option in modes"
        :key="option.id"
        type="button"
        role="tab"
        :aria-selected="mode === option.id"
        :disabled="authStore.loading"
        class="flex h-9 items-center justify-center gap-2 rounded-sm text-sm font-semibold transition-colors"
        :class="
          mode === option.id ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-900'
        "
        @click="selectMode(option.id)"
      >
        <component :is="option.icon" :size="16" aria-hidden="true" />
        {{ option.label }}
      </button>
    </div>

    <form class="mt-6 space-y-4" novalidate @submit.prevent="handleLogin">
      <Transition name="fade" mode="out-in">
        <div v-if="mode === 'kid'" key="kid" class="space-y-4">
          <AppField
            v-model="familyCode"
            label="Family code"
            hint="Your grown-up can find this on their dashboard."
            autocomplete="off"
            :maxlength="10"
            input-class="font-mono uppercase tracking-widest"
            :disabled="authStore.loading"
            @update:model-value="clearError"
          />
          <AppField
            v-model="username"
            label="Username"
            autocomplete="username"
            :maxlength="20"
            :disabled="authStore.loading"
            @update:model-value="clearError"
          />
          <AppField
            v-model="pin"
            label="PIN"
            type="password"
            inputmode="numeric"
            autocomplete="current-password"
            :maxlength="4"
            input-class="font-mono tracking-widest"
            :disabled="authStore.loading"
            @update:model-value="clearError"
          />
        </div>

        <div v-else key="parent" class="space-y-4">
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
        </div>
      </Transition>

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
      <template v-if="mode === 'kid'">No login yet? Ask a grown-up to set one up.</template>
      <template v-else>
        New to Touch Grass?
        <RouterLink
          to="/signup"
          class="font-semibold text-grass-700 transition-colors hover:text-grass-600"
        >
          Create a parent account
        </RouterLink>
      </template>
    </template>
  </AuthLayout>
</template>
