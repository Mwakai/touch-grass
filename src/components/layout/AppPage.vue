<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, type RouteLocationRaw } from 'vue-router'
import { ArrowLeft, LogOut } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import AppButton from '@/components/ui/AppButton.vue'
import AppLogo from '@/components/ui/AppLogo.vue'

/**
 * Shell for every signed-in page, so the top bar, back link, title and
 * page actions always sit in the same place.
 */
withDefaults(
  defineProps<{
    title: string
    eyebrow?: string
    backTo?: RouteLocationRaw
    backLabel?: string
    /** `adventure` puts the page on the kid screens' trail-map meadow. */
    tone?: 'calm' | 'adventure'
  }>(),
  { tone: 'calm' },
)

const router = useRouter()
const authStore = useAuthStore()
const isLoggingOut = ref(false)

const handleLogout = async () => {
  isLoggingOut.value = true
  // The store clears local auth state even when the API call fails
  await authStore.logout()
  isLoggingOut.value = false
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen pb-16" :class="tone === 'adventure' && 'bg-meadow-100'">
    <header
      class="border-b"
      :class="tone === 'adventure' ? 'border-meadow-200 bg-meadow-50' : 'border-ink-200 bg-white'"
    >
      <div class="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        <AppLogo />
        <AppButton
          variant="ghost"
          size="sm"
          :icon="LogOut"
          :loading="isLoggingOut"
          @click="handleLogout"
        >
          {{ isLoggingOut ? 'Logging out' : 'Log out' }}
        </AppButton>
      </div>
    </header>

    <div class="mx-auto max-w-4xl px-4 sm:px-6">
      <div class="flex flex-wrap items-end justify-between gap-4 pb-6 pt-6 sm:pt-8">
        <div class="min-w-0">
          <RouterLink
            v-if="backTo"
            :to="backTo"
            class="-ml-1 mb-3 inline-flex items-center gap-1 rounded-sm px-1 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
          >
            <ArrowLeft :size="16" aria-hidden="true" />
            {{ backLabel ?? 'Back' }}
          </RouterLink>
          <p v-if="eyebrow" class="text-sm font-medium text-ink-500">{{ eyebrow }}</p>
          <h1 class="truncate text-2xl font-semibold text-ink-900">{{ title }}</h1>
        </div>
        <div v-if="$slots.actions" class="flex items-center gap-2">
          <slot name="actions" />
        </div>
      </div>

      <main>
        <slot />
      </main>
    </div>
  </div>
</template>
