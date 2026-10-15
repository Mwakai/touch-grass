<script setup lang="ts">
import AppLogo from '@/components/ui/AppLogo.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col items-center px-4 py-12 sm:justify-center">
    <AppLogo size="lg" />
    <main class="mt-8 w-full max-w-md animate-enter rounded-lg bg-white p-6 shadow-sm sm:p-8">
      <slot />
    </main>
    <p v-if="$slots.footer" class="mt-6 text-center text-sm text-ink-500">
      <slot name="footer" />
    </p>
  </div>
</template>
