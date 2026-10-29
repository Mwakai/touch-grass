<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Check, KeyRound } from '@lucide/vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { normalizeUsername, pinError, usernameError } from '@/utils/kidLogin'
import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'

/**
 * Creates or changes a kid's username and PIN. Saving also unlocks a login
 * locked by too many wrong PINs, so this is how a parent resets one.
 */
const props = defineProps<{
  kidId: string
  kidName: string
  hasLogin: boolean
}>()

const emit = defineEmits<{ saved: [] }>()

const authStore = useAuthStore()

const form = reactive({ username: '', pin: '' })
const errors = ref<{ username?: string; pin?: string }>({})
const isSaving = ref(false)
const saveError = ref<string | null>(null)
const savedUsername = ref<string | null>(null)

const handleSubmit = async () => {
  const nextErrors = { username: usernameError(form.username), pin: pinError(form.pin) }
  errors.value = nextErrors
  if (nextErrors.username || nextErrors.pin) return

  isSaving.value = true
  saveError.value = null
  savedUsername.value = null

  try {
    const login = await api.setKidLogin(props.kidId, {
      username: normalizeUsername(form.username),
      pin: form.pin,
    })
    savedUsername.value = login.username
    form.pin = ''
    emit('saved')
  } catch (error: unknown) {
    console.error('Failed to save kid login:', error)
    saveError.value = error instanceof Error ? error.message : 'Could not save the login.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <form
    class="mt-6 animate-enter rounded-lg bg-white p-5 shadow-sm sm:p-8"
    novalidate
    @submit.prevent="handleSubmit"
  >
    <div class="flex items-start gap-3">
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-full bg-grass-50 text-grass-600"
      >
        <KeyRound :size="20" aria-hidden="true" />
      </span>
      <div>
        <h2 class="text-lg font-semibold text-ink-900">{{ kidName }}’s login</h2>
        <p class="mt-1 text-sm text-ink-500">
          {{
            hasLogin
              ? 'Change their username or PIN. Saving also unlocks a login after too many wrong PINs.'
              : 'They don’t have a login yet. Pick a username and a 4-digit PIN. No email needed.'
          }}
        </p>
      </div>
    </div>

    <div class="mt-6 grid gap-6 sm:grid-cols-[1fr_8rem]">
      <AppField
        v-model="form.username"
        label="Username"
        autocomplete="off"
        :maxlength="20"
        :error="errors.username"
        :disabled="isSaving"
        @update:model-value="errors.username = undefined"
      />
      <AppField
        v-model="form.pin"
        :label="hasLogin ? 'New PIN' : 'PIN'"
        inputmode="numeric"
        autocomplete="off"
        :maxlength="4"
        input-class="font-mono tracking-widest"
        :error="errors.pin"
        :disabled="isSaving"
        @update:model-value="errors.pin = undefined"
      />
    </div>

    <p
      v-if="saveError"
      role="alert"
      class="mt-6 rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700"
    >
      {{ saveError }}
    </p>

    <p
      v-if="savedUsername"
      role="status"
      class="mt-6 flex items-start gap-2 rounded-md bg-grass-50 px-4 py-3 text-sm text-grass-700"
    >
      <Check :size="18" class="mt-px shrink-0" aria-hidden="true" />
      <span>
        Saved. {{ kidName }} logs in with family code
        <span class="font-mono font-semibold tracking-widest">{{ authStore.user?.familyCode }}</span
        >, username <span class="font-semibold">{{ savedUsername }}</span> and their new PIN.
      </span>
    </p>

    <div class="mt-6 flex justify-end">
      <AppButton type="submit" variant="secondary" :loading="isSaving">
        {{ isSaving ? 'Saving' : hasLogin ? 'Update login' : 'Create login' }}
      </AppButton>
    </div>
  </form>
</template>
