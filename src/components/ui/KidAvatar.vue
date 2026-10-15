<script setup lang="ts">
import { computed } from 'vue'
import { resolveAvatarColor } from '@/data/avatarColors'

const props = withDefaults(
  defineProps<{
    name: string
    color?: string
    size?: 'md' | 'lg'
  }>(),
  { size: 'md' },
)

const background = computed(() => resolveAvatarColor(props.color).hex)
const initial = computed(() => props.name.trim().charAt(0).toUpperCase() || '?')
</script>

<template>
  <div
    class="flex shrink-0 items-center justify-center rounded-full font-semibold text-white transition-colors"
    :class="size === 'lg' ? 'size-16 text-2xl' : 'size-12 text-lg'"
    :style="{ backgroundColor: background }"
    aria-hidden="true"
  >
    {{ initial }}
  </div>
</template>
