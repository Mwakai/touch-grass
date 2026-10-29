<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Check, Copy } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import { getDefaultRouteForUser } from '@/utils/authRedirect'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const consent = ref(false)
const error = ref('')
const signupSuccess = ref(false)
const parentFamilyCode = ref('') // To show after signup
const copied = ref(false)
const isContinuing = ref(false)

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const handleSignup = async () => {
  error.value = ''

  if (!email.value || !password.value || !confirmPassword.value) {
    error.value = 'Fill in your email and both password fields'
    return
  }

  if (!validateEmail(email.value)) {
    error.value = 'Enter a valid email address'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Use at least 6 characters for your password'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'The passwords don’t match'
    return
  }

  if (!consent.value) {
    error.value = 'Accept the privacy policy to create an account'
    return
  }

  try {
    await authStore.signup({ email: email.value, password: password.value, consent: true })

    // Show the family code before continuing
    if (authStore.user?.familyCode) {
      parentFamilyCode.value = authStore.user.familyCode
      signupSuccess.value = true
      return
    }

    // Wait for Vue reactivity to complete, then redirect
    await nextTick()
    await router.push(getDefaultRouteForUser(authStore.user))
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : 'Could not create your account. Please try again.'
    console.error('Signup error:', e)
  }
}

const copyFamilyCode = async () => {
  try {
    await navigator.clipboard.writeText(parentFamilyCode.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch (e) {
    console.error('Copy failed:', e)
  }
}

const continueToApp = async () => {
  isContinuing.value = true
  await router.push(getDefaultRouteForUser(authStore.user))
}

const clearError = () => {
  error.value = ''
}
</script>

<template>
  <AuthLayout>
    <!-- Parent signup succeeded: show the family code -->
    <div v-if="signupSuccess && parentFamilyCode" class="animate-enter">
      <span
        class="flex size-11 items-center justify-center rounded-full bg-grass-50 text-grass-600"
      >
        <Check :size="20" aria-hidden="true" />
      </span>
      <h1 class="mt-4 text-xl font-semibold text-ink-900">Account created</h1>
      <p class="mt-1 text-base text-ink-500">
        Your kids log in with this code plus the username and PIN you set when you add them.
      </p>

      <div class="mt-6 flex items-center justify-between gap-4 rounded-md bg-ink-50 p-4">
        <div>
          <p class="text-xs font-medium text-ink-500">Family code</p>
          <p class="mt-1 font-mono text-xl font-semibold tracking-widest text-ink-900">
            {{ parentFamilyCode }}
          </p>
        </div>
        <AppButton
          variant="secondary"
          size="sm"
          :icon="copied ? Check : Copy"
          @click="copyFamilyCode"
        >
          {{ copied ? 'Copied' : 'Copy' }}
        </AppButton>
      </div>

      <AppButton class="mt-6" block :loading="isContinuing" @click="continueToApp">
        Continue to dashboard
      </AppButton>
    </div>

    <template v-else>
      <h1 class="text-xl font-semibold text-ink-900">Create an account</h1>
      <p class="mt-1 text-base text-ink-500">
        Parents create the account. Kids don’t need an email: you make their login.
      </p>

      <form class="mt-6 space-y-4" novalidate @submit.prevent="handleSignup">
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
          autocomplete="new-password"
          hint="At least 6 characters"
          :disabled="authStore.loading"
          @update:model-value="clearError"
        />
        <AppField
          v-model="confirmPassword"
          label="Confirm password"
          type="password"
          autocomplete="new-password"
          :disabled="authStore.loading"
          @update:model-value="clearError"
        />

        <label class="flex items-start gap-3 text-sm text-ink-700">
          <input
            v-model="consent"
            type="checkbox"
            class="mt-0.5 size-5 shrink-0 accent-grass-600"
            :disabled="authStore.loading"
            @change="clearError"
          />
          <span>
            I’m a parent or guardian and I accept the
            <a
              :href="api.privacyPolicyUrl"
              target="_blank"
              rel="noopener"
              class="font-semibold text-grass-700 underline hover:text-grass-600"
              >privacy policy</a
            >.
          </span>
        </label>

        <p
          v-if="error"
          role="alert"
          class="rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700"
        >
          {{ error }}
        </p>

        <AppButton type="submit" block :loading="authStore.loading">
          {{ authStore.loading ? 'Creating account' : 'Create account' }}
        </AppButton>
      </form>
    </template>

    <template v-if="!signupSuccess" #footer>
      Already have an account?
      <RouterLink
        to="/login"
        class="font-semibold text-grass-700 transition-colors hover:text-grass-600"
      >
        Log in
      </RouterLink>
    </template>
  </AuthLayout>
</template>
