<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { Celebration } from '@/composables/useCelebrations'
import BadgePatch from './BadgePatch.vue'
import LevelShield from './LevelShield.vue'

/** Shows one level-up or new patch at a time. */
const props = defineProps<{ celebration: Celebration | null }>()
const emit = defineEmits<{ dismiss: [] }>()

const button = ref<HTMLButtonElement | null>(null)

watch(
  () => props.celebration,
  async (value) => {
    if (value) {
      await nextTick()
      button.value?.focus()
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="celebration"
      class="fixed inset-0 z-50 flex items-center justify-center bg-forest-900/95 px-6 backdrop-blur-sm"
      @keydown.esc="emit('dismiss')"
    >
      <div
        :key="celebration.key"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
        aria-describedby="celebration-text"
        class="flex w-full max-w-xs flex-col items-center text-center"
      >
        <div class="animate-pop">
          <LevelShield v-if="celebration.kind === 'level'" :level="celebration.level" size="lg" />
          <BadgePatch v-else :icon="celebration.badge.icon" earned size="lg" />
        </div>

        <h2 id="celebration-title" class="mt-6 font-display text-3xl text-sun-400">
          {{ celebration.kind === 'level' ? `Level ${celebration.level}!` : 'New patch!' }}
        </h2>
        <p id="celebration-text" class="mt-2 text-lg text-white">
          <template v-if="celebration.kind === 'level'">
            {{
              celebration.unlockedRegion
                ? `${celebration.unlockedRegion} is open. Go explore!`
                : 'You’re getting stronger out there.'
            }}
          </template>
          <template v-else>
            <span class="font-semibold">{{ celebration.badge.name }}</span
            >.
            {{ celebration.badge.description }}
          </template>
        </p>

        <button
          ref="button"
          type="button"
          class="mt-8 h-14 w-full rounded-md bg-sun-400 font-display text-xl text-forest-900 shadow-[0_5px_0_var(--color-bark-500)] transition-transform active:translate-y-1 active:shadow-[0_1px_0_var(--color-bark-500)]"
          @click="emit('dismiss')"
        >
          Keep exploring
        </button>
      </div>
    </div>
  </Teleport>
</template>
