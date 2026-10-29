<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Check } from '@lucide/vue'
import { avatarColors, defaultAvatarColorId, resolveAvatarColor } from '@/data/avatarColors'
import { interestOptions } from '@/data/interests'
import { api } from '@/services/api'
import { normalizeUsername, pinError, usernameError } from '@/utils/kidLogin'
import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'
import KidAvatar from '@/components/ui/KidAvatar.vue'

export type KidFormValues = {
  name: string
  age: number
  avatarColor: string
  interests: string[]
}

// Only collected when adding a kid
export type KidSetupValues = {
  consent: boolean
  username?: string
  pin?: string
}

const props = defineProps<{
  initial?: Partial<KidFormValues>
  /** Adding a new kid: ask for consent and offer to create their login. */
  setup?: boolean
  submitLabel: string
  submittingLabel: string
  submitting: boolean
  submitError?: string | null
}>()

const emit = defineEmits<{
  submit: [values: KidFormValues, setup?: KidSetupValues]
  cancel: []
}>()

const form = reactive({
  name: props.initial?.name ?? '',
  age: props.initial?.age ? String(props.initial.age) : '',
  avatarColor: resolveAvatarColor(props.initial?.avatarColor ?? defaultAvatarColorId).id,
  interests: [...(props.initial?.interests ?? [])],
  username: '',
  pin: '',
  consent: false,
})

const errors = ref<
  Partial<Record<'name' | 'age' | 'interests' | 'username' | 'pin' | 'consent', string>>
>({})

const toggleInterest = (interestId: string) => {
  form.interests = form.interests.includes(interestId)
    ? form.interests.filter((id) => id !== interestId)
    : [...form.interests, interestId]
  errors.value.interests = undefined
}

const handleSubmit = () => {
  const age = Number.parseInt(form.age, 10)
  const nextErrors: typeof errors.value = {}

  if (!form.name.trim()) nextErrors.name = 'Enter a name'
  if (!age || age < 1 || age > 18) nextErrors.age = 'Enter an age between 1 and 18'
  if (!form.interests.length) nextErrors.interests = 'Pick at least one interest'

  // The login is optional, but needs both parts once either is filled in
  const wantsLogin = props.setup && Boolean(form.username.trim() || form.pin)
  if (wantsLogin) {
    nextErrors.username = usernameError(form.username)
    nextErrors.pin = pinError(form.pin)
  }
  if (props.setup && !form.consent) {
    nextErrors.consent = 'Confirm you’re their parent or guardian to add them'
  }

  errors.value = Object.fromEntries(Object.entries(nextErrors).filter(([, message]) => message))
  if (Object.keys(errors.value).length) return

  const values = {
    name: form.name.trim(),
    age,
    avatarColor: form.avatarColor,
    interests: form.interests,
  }

  if (!props.setup) {
    emit('submit', values)
    return
  }

  emit('submit', values, {
    consent: true,
    ...(wantsLogin && { username: normalizeUsername(form.username), pin: form.pin }),
  })
}
</script>

<template>
  <form
    class="animate-enter rounded-lg bg-white p-5 shadow-sm sm:p-8"
    novalidate
    @submit.prevent="handleSubmit"
  >
    <div class="flex items-center gap-4">
      <KidAvatar :name="form.name || '?'" :color="form.avatarColor" size="lg" />
      <div class="min-w-0">
        <p class="truncate text-lg font-semibold text-ink-900">{{ form.name || 'New explorer' }}</p>
        <p class="text-sm text-ink-500">
          {{ form.age ? `${form.age} years old` : 'Age not set' }}
        </p>
      </div>
    </div>

    <div class="mt-8 grid gap-6 sm:grid-cols-[1fr_8rem]">
      <AppField
        v-model="form.name"
        label="Name"
        placeholder="First name"
        autocomplete="off"
        :error="errors.name"
        :disabled="submitting"
        @update:model-value="errors.name = undefined"
      />
      <AppField
        v-model="form.age"
        label="Age"
        type="number"
        inputmode="numeric"
        :min="1"
        :max="18"
        :error="errors.age"
        :disabled="submitting"
        @update:model-value="errors.age = undefined"
      />
    </div>

    <fieldset class="mt-6">
      <legend class="mb-3 text-sm font-medium text-ink-700">Avatar color</legend>
      <div class="flex flex-wrap gap-3" role="radiogroup">
        <button
          v-for="color in avatarColors"
          :key="color.id"
          type="button"
          role="radio"
          :aria-checked="form.avatarColor === color.id"
          :aria-label="color.label"
          :title="color.label"
          :disabled="submitting"
          class="flex size-11 items-center justify-center rounded-full text-white ring-offset-2 transition-shadow"
          :class="
            form.avatarColor === color.id
              ? 'ring-2 ring-ink-900'
              : 'hover:ring-2 hover:ring-ink-300'
          "
          :style="{ backgroundColor: color.hex }"
          @click="form.avatarColor = color.id"
        >
          <Check v-if="form.avatarColor === color.id" :size="18" aria-hidden="true" />
        </button>
      </div>
    </fieldset>

    <fieldset class="mt-6">
      <legend class="mb-3 text-sm font-medium text-ink-700">Interests</legend>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="interest in interestOptions"
          :key="interest.id"
          type="button"
          :aria-pressed="form.interests.includes(interest.id)"
          :disabled="submitting"
          class="inline-flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors"
          :class="
            form.interests.includes(interest.id)
              ? 'border-grass-600 bg-grass-50 text-grass-700'
              : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
          "
          @click="toggleInterest(interest.id)"
        >
          <component :is="interest.icon" :size="16" aria-hidden="true" />
          {{ interest.label }}
        </button>
      </div>
      <p v-if="errors.interests" class="mt-2 text-sm text-danger-600">{{ errors.interests }}</p>
    </fieldset>

    <template v-if="setup">
      <fieldset class="mt-8 border-t border-ink-200 pt-6">
        <legend class="sr-only">Their login</legend>
        <p class="text-sm font-medium text-ink-700">Their login</p>
        <p class="mt-1 text-sm text-ink-500">
          Kids log in with your family code, this username and PIN. No email needed. You can also
          add it later.
        </p>
        <div class="mt-4 grid gap-6 sm:grid-cols-[1fr_8rem]">
          <AppField
            v-model="form.username"
            label="Username"
            autocomplete="off"
            :maxlength="20"
            :error="errors.username"
            :disabled="submitting"
            @update:model-value="errors.username = undefined"
          />
          <AppField
            v-model="form.pin"
            label="PIN"
            inputmode="numeric"
            autocomplete="off"
            :maxlength="4"
            input-class="font-mono tracking-widest"
            :error="errors.pin"
            :disabled="submitting"
            @update:model-value="errors.pin = undefined"
          />
        </div>
      </fieldset>

      <div class="mt-8 border-t border-ink-200 pt-6">
        <label class="flex items-start gap-3 text-sm text-ink-700">
          <input
            v-model="form.consent"
            type="checkbox"
            class="mt-0.5 size-5 shrink-0 accent-grass-600"
            :disabled="submitting"
            @change="errors.consent = undefined"
          />
          <span>
            I’m this child’s parent or guardian and I agree to Touch Grass storing their name, age,
            interests and challenge history as described in the
            <a
              :href="api.privacyPolicyUrl"
              target="_blank"
              rel="noopener"
              class="font-semibold text-grass-700 underline hover:text-grass-600"
              >privacy policy</a
            >.
          </span>
        </label>
        <p v-if="errors.consent" class="mt-2 text-sm text-danger-600">{{ errors.consent }}</p>
      </div>
    </template>

    <p
      v-if="submitError"
      role="alert"
      class="mt-8 rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700"
    >
      {{ submitError }}
    </p>

    <div class="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <AppButton variant="ghost" :disabled="submitting" @click="emit('cancel')">Cancel</AppButton>
      <AppButton type="submit" :loading="submitting">
        {{ submitting ? submittingLabel : submitLabel }}
      </AppButton>
    </div>
  </form>
</template>
