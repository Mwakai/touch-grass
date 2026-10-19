<script setup lang="ts">
import { CircleAlert, RefreshCw } from '@lucide/vue'
import AppButton from './AppButton.vue'

defineProps<{ message: string }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    role="alert"
    class="flex animate-enter flex-col items-center rounded-lg bg-danger-50 px-6 py-10 text-center"
  >
    <CircleAlert :size="24" class="text-danger-600" aria-hidden="true" />
    <p class="mt-3 max-w-sm text-base text-danger-700">{{ message }}</p>
    <AppButton class="mt-6" variant="secondary" :icon="RefreshCw" @click="$emit('retry')">
      Try again
    </AppButton>
  </div>
</template>
