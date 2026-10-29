<script setup lang="ts">
import { useId } from 'vue'

// Bound manually below: v-model on type="number" would cast the value to a number
const model = defineModel<string>({ default: '' })

withDefaults(
  defineProps<{
    label: string
    type?: string
    placeholder?: string
    hint?: string
    error?: string
    disabled?: boolean
    autocomplete?: string
    inputmode?: 'text' | 'email' | 'numeric'
    maxlength?: number
    min?: number
    max?: number
    inputClass?: string
  }>(),
  { type: 'text' },
)

const id = useId()
</script>

<template>
  <div>
    <label :for="id" class="mb-2 block text-sm font-medium text-ink-700">{{ label }}</label>
    <input
      :id="id"
      :value="model"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :maxlength="maxlength"
      :min="min"
      :max="max"
      :aria-invalid="!!error || undefined"
      :aria-describedby="error || hint ? `${id}-note` : undefined"
      class="h-11 w-full rounded-md border bg-white px-3 text-base text-ink-900 transition-colors placeholder:text-ink-400 focus:border-grass-500 focus:outline-none disabled:bg-ink-100 disabled:text-ink-500"
      :class="[error ? 'border-danger-600' : 'border-ink-200 hover:border-ink-300', inputClass]"
      @input="model = ($event.target as HTMLInputElement).value"
    />
    <p
      v-if="error || hint"
      :id="`${id}-note`"
      class="mt-2 text-sm"
      :class="error ? 'text-danger-600' : 'text-ink-500'"
    >
      {{ error || hint }}
    </p>
  </div>
</template>
