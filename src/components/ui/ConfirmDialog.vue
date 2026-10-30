<script setup lang="ts">
import { nextTick, ref, useId, watch } from 'vue'
import AppButton from './AppButton.vue'

const props = defineProps<{
  open: boolean
  title: string
  message: string
  confirmLabel: string
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{ confirm: []; cancel: [] }>()

const id = useId()
const cancelButton = ref<InstanceType<typeof AppButton> | null>(null)

const cancel = () => {
  if (!props.loading) emit('cancel')
}

watch(
  () => props.open,
  async (open) => {
    if (!open) return
    await nextTick()
    ;(cancelButton.value?.$el as HTMLElement | undefined)?.focus()
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog" :duration="{ enter: 280, leave: 200 }">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
        @keydown.esc="cancel"
      >
        <div
          data-backdrop
          class="absolute inset-0 bg-ink-900/40"
          aria-hidden="true"
          @click="cancel"
        />
        <div
          data-panel
          role="alertdialog"
          aria-modal="true"
          :aria-labelledby="`${id}-title`"
          :aria-describedby="`${id}-message`"
          class="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-md"
        >
          <h2 :id="`${id}-title`" class="text-lg font-semibold text-ink-900">{{ title }}</h2>
          <p :id="`${id}-message`" class="mt-2 text-base text-ink-500">{{ message }}</p>
          <p v-if="error" role="alert" class="mt-4 text-sm text-danger-600">{{ error }}</p>
          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AppButton ref="cancelButton" variant="secondary" :disabled="loading" @click="cancel">
              Cancel
            </AppButton>
            <AppButton variant="danger" :loading="loading" @click="emit('confirm')">
              {{ confirmLabel }}
            </AppButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
