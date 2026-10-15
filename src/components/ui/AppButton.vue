<script setup lang="ts">
import { computed, type Component } from 'vue'
import { LoaderCircle } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    type?: 'button' | 'submit'
    icon?: Component
    loading?: boolean
    disabled?: boolean
    block?: boolean
    /** Renders an icon-only button; `label` becomes its accessible name. */
    iconOnly?: boolean
    label?: string
  }>(),
  { variant: 'primary', size: 'md', type: 'button' },
)

const variants = {
  primary: 'bg-grass-600 text-white hover:bg-grass-700',
  secondary: 'bg-white text-ink-700 shadow-sm hover:bg-ink-100 hover:text-ink-900',
  ghost: 'text-ink-500 hover:bg-ink-100 hover:text-ink-900',
  danger: 'bg-danger-600 text-white hover:bg-danger-700',
}

const classes = computed(() => [
  'relative inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-semibold transition-colors',
  'disabled:cursor-not-allowed disabled:opacity-60',
  variants[props.variant],
  props.size === 'sm' ? 'h-9 text-sm' : 'h-11 text-sm',
  props.iconOnly ? (props.size === 'sm' ? 'w-9' : 'w-11') : props.size === 'sm' ? 'px-3' : 'px-4',
  props.block && 'w-full',
])
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :aria-label="iconOnly ? label : undefined"
    :title="iconOnly ? label : undefined"
  >
    <LoaderCircle v-if="loading" :size="16" class="animate-spin" aria-hidden="true" />
    <component :is="icon" v-else-if="icon" :size="16" aria-hidden="true" />
    <span v-if="!iconOnly"
      ><slot>{{ label }}</slot></span
    >
  </button>
</template>
