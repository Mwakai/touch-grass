<script setup lang="ts">
/** Ranger-style shield with the kid's level, in park-sign lettering. */
withDefaults(defineProps<{ level: number; size?: 'md' | 'lg' }>(), { size: 'md' })
</script>

<template>
  <span
    class="relative inline-flex shrink-0 items-center justify-center"
    :class="size === 'lg' ? 'h-36 w-32' : 'h-16 w-14'"
    role="img"
    :aria-label="`Level ${level}`"
  >
    <svg viewBox="0 0 56 64" class="absolute inset-0 size-full" aria-hidden="true">
      <path
        d="M28 2 L52 10 V30 C52 46 41 56 28 62 C15 56 4 46 4 30 V10 Z"
        class="fill-forest-900"
      />
      <path
        d="M28 7 L47 13.5 V30 C47 43 38 51.5 28 56.5 C18 51.5 9 43 9 30 V13.5 Z"
        class="fill-none stroke-sun-400"
        stroke-width="1.5"
        stroke-dasharray="3 2.5"
      />
    </svg>
    <span
      class="relative flex flex-col items-center leading-none text-sun-400"
      :class="size === 'lg' ? 'pb-2' : 'pb-1 pt-1'"
    >
      <span class="font-display" :class="size === 'lg' ? 'text-base' : 'text-[0.5625rem]'">
        Level
      </span>
      <span class="font-display text-white" :class="size === 'lg' ? 'text-4xl' : 'text-2xl'">
        {{ level }}
      </span>
    </span>
  </span>
</template>
