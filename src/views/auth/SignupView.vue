<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Check, Copy, User, Users } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { getDefaultRouteForUser } from '@/utils/authRedirect'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'

type Role = 'parent' | 'kid'

const router = useRouter()
const authStore = useAuthStore()

const roles = [
  { id: 'parent', label: 'Parent', description: 'Set up your family', icon: Users },
  { id: 'kid', label: 'Kid', description: 'Join with a family code', icon: User },
] as const

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const selectedRole = ref<Role | ''>('')
const name = ref('') // For kid signup
const familyCode = ref('') // For kid signup
const age = ref('') // For kid signup
const error = ref('')
const signupSuccess = ref(false)
const parentFamilyCode = ref('') // To show after parent signup
const copied = ref(false)
const isContinuing = ref(false)

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const selectRole = (role: Role): void => {
  selectedRole.value = role
  clearError()
}

const handleSignup = async () => {
  error.value = ''

  if (!selectedRole.value) {
    error.value = 'Choose whether you are a parent or a kid'
    return
  }

  // Kid-specific validation
  if (selectedRole.value === 'kid') {
    if (!name.value.trim()) {
      error.value = 'Enter your name'
      return
    }
    const parsedAge = Number.parseInt(age.value, 10)
    if (!parsedAge || parsedAge < 1 || parsedAge > 18) {
      error.value = 'Enter an age between 1 and 18'
      return
    }
    if (!familyCode.value.trim()) {
      error.value = 'Enter the family code from your parent'
      return
    }
  }

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

  try {
    const signupData = {
      email: email.value,
      password: password.value,
      role: selectedRole.value,
      ...(selectedRole.value === 'kid' && {
        name: name.value.trim(),
        familyCode: familyCode.value.trim().toUpperCase(),
        age: Number.parseInt(age.value, 10),
      }),
    }

    await authStore.signup(signupData)

    // Parents see their family code before continuing
    if (selectedRole.value === 'parent' && authStore.user?.familyCode) {
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
        Your kids enter this code when they sign up, which links them to your family.
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
      <p class="mt-1 text-base text-ink-500">Parents set up the family first, then kids join.</p>

      <form class="mt-6 space-y-4" novalidate @submit.prevent="handleSignup">
        <fieldset>
          <legend class="mb-2 text-sm font-medium text-ink-700">I am a</legend>
          <div class="grid grid-cols-2 gap-3" role="radiogroup">
            <button
              v-for="role in roles"
              :key="role.id"
              type="button"
              role="radio"
              :aria-checked="selectedRole === role.id"
              :disabled="authStore.loading"
              class="flex flex-col items-start gap-2 rounded-md border p-4 text-left transition-colors"
              :class="
                selectedRole === role.id
                  ? 'border-grass-600 bg-grass-50'
                  : 'border-ink-200 bg-white hover:border-ink-300'
              "
              @click="selectRole(role.id)"
            >
              <component
                :is="role.icon"
                :size="20"
                :class="selectedRole === role.id ? 'text-grass-600' : 'text-ink-500'"
                aria-hidden="true"
              />
              <span>
                <span class="block text-base font-semibold text-ink-900">{{ role.label }}</span>
                <span class="block text-sm text-ink-500">{{ role.description }}</span>
              </span>
            </button>
          </div>
        </fieldset>

        <template v-if="selectedRole === 'kid'">
          <div class="grid gap-4 sm:grid-cols-[1fr_6rem]">
            <AppField
              v-model="name"
              label="Your name"
              autocomplete="given-name"
              :disabled="authStore.loading"
              @update:model-value="clearError"
            />
            <AppField
              v-model="age"
              label="Age"
              type="number"
              inputmode="numeric"
              :min="1"
              :max="18"
              :disabled="authStore.loading"
              @update:model-value="clearError"
            />
          </div>
          <AppField
            v-model="familyCode"
            label="Family code"
            hint="Your parent can find this on their account."
            autocomplete="off"
            :maxlength="10"
            input-class="font-mono uppercase tracking-widest"
            :disabled="authStore.loading"
            @update:model-value="clearError"
          />
        </template>

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
