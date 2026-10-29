<script setup lang="ts">
import { gameIcon } from '@/data/game'

/** A badge drawn as an embroidered patch. Unearned patches are an empty stitched outline. */
withDefaults(defineProps<{ icon: string; earned: boolean; size?: 'md' | 'lg' }>(), {
  size: 'md',
})
</script>

<template>
  <span
    class="relative flex shrink-0 items-center justify-center rounded-full"
    :class="[
      size === 'lg' ? 'size-32' : 'size-20',
      earned
        ? 'bg-forest-700 text-sun-400 shadow-[0_3px_0_var(--color-forest-900)]'
        : 'bg-meadow-100 text-bark-300',
    ]"
    aria-hidden="true"
  >
    <span
      class="absolute rounded-full border-2 border-dashed"
      :class="[
        size === 'lg' ? 'inset-2' : 'inset-1.5',
        earned ? 'border-sun-400' : 'border-bark-300',
      ]"
    />
    <component
      :is="gameIcon(icon)"
      :size="size === 'lg' ? 52 : 30"
      :stroke-width="earned ? 2.25 : 1.75"
    />
  </span>
</template>
