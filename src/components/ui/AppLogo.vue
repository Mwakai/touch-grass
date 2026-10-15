<script setup lang="ts">
import { Sprout } from 'lucide-vue-next'

defineProps<{ size?: 'md' | 'lg' }>()
</script>

<template>
  <span class="inline-flex items-center gap-2 text-ink-900">
    <span
      class="flex items-center justify-center rounded-sm bg-grass-600 text-white"
      :class="size === 'lg' ? 'size-10' : 'size-8'"
    >
      <Sprout :size="size === 'lg' ? 22 : 18" aria-hidden="true" />
    </span>
    <span class="font-semibold" :class="size === 'lg' ? 'text-xl' : 'text-base'">Touch Grass</span>
  </span>
</template>
