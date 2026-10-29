<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { Camera, Clock, Hourglass, LoaderCircle, Lock, Sparkles, Star, X } from '@lucide/vue'
import { gameIcon, type GameChallenge, type GameRegion } from '@/data/game'

/** Bottom sheet with one challenge's details and, for the kid, the "I did it" button. */
const props = defineProps<{
  challenge: GameChallenge | null
  region: GameRegion | null
  /** Parents see the same sheet without the button. */
  readonly?: boolean
  submitting?: boolean
  error?: string | null
}>()

const emit = defineEmits<{ close: []; submit: [note: string] }>()

const note = ref('')

// Photos never leave the device: the app has no upload, so say where they go
const asksForPhoto = computed(() => /photo/i.test(props.challenge?.description ?? ''))
const closeButton = ref<HTMLButtonElement | null>(null)

watch(
  () => props.challenge?.id,
  async (id) => {
    note.value = ''
    if (id) {
      await nextTick()
      closeButton.value?.focus()
    }
  },
)

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.challenge) emit('close')
}
window.addEventListener('keydown', onKeydown)
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div v-if="challenge && region" class="fixed inset-0 z-40 flex items-end justify-center">
      <div class="absolute inset-0 bg-forest-900/50" aria-hidden="true" @click="emit('close')" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="challenge-title"
        class="relative w-full max-w-md animate-sheet rounded-t-lg bg-meadow-50 px-5 pb-8 pt-5"
      >
        <div class="flex items-start gap-4">
          <span
            class="flex size-16 shrink-0 items-center justify-center rounded-lg bg-forest-900 text-sun-400"
          >
            <component :is="gameIcon(challenge.icon)" :size="32" aria-hidden="true" />
          </span>
          <div class="min-w-0 flex-1 pt-1">
            <p class="text-sm font-medium text-bark-500">{{ region.name }}</p>
            <h2 id="challenge-title" class="font-display text-2xl text-forest-900">
              {{ challenge.title }}
            </h2>
          </div>
          <button
            ref="closeButton"
            type="button"
            class="-mr-2 -mt-1 flex size-10 items-center justify-center rounded-full text-forest-700 hover:bg-meadow-200"
            aria-label="Close"
            @click="emit('close')"
          >
            <X :size="20" aria-hidden="true" />
          </button>
        </div>

        <p class="mt-4 text-lg text-forest-900">{{ challenge.description }}</p>

        <p
          v-if="asksForPhoto"
          class="mt-3 flex items-start gap-2 rounded-md bg-meadow-100 px-3 py-2 text-sm text-forest-900"
        >
          <Camera :size="16" class="mt-0.5 shrink-0" aria-hidden="true" />
          {{
            readonly
              ? 'Photos stay on your kid’s device. Ask them to show you.'
              : 'Keep your photo on your device and show it to your grown-up. Touch Grass never uploads it.'
          }}
        </p>

        <ul class="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
          <li class="inline-flex items-center gap-1 rounded-full bg-sun-100 px-3 py-1 text-sun-700">
            <Star :size="14" aria-hidden="true" />
            {{ challenge.xp }} XP
          </li>
          <li
            class="inline-flex items-center gap-1 rounded-full bg-meadow-200 px-3 py-1 text-forest-700"
          >
            <Clock :size="14" aria-hidden="true" />
            About {{ challenge.minutes }} min
          </li>
          <li
            v-if="challenge.recommended && challenge.status === 'available'"
            class="inline-flex items-center gap-1 rounded-full bg-forest-900 px-3 py-1 text-sun-400"
          >
            <Sparkles :size="14" aria-hidden="true" />
            Matches what you like
          </li>
        </ul>

        <div class="mt-6">
          <template v-if="challenge.status === 'available' && !readonly">
            <label for="challenge-note" class="text-sm font-semibold text-forest-900">
              What did you find? <span class="font-regular text-forest-700">(optional)</span>
            </label>
            <textarea
              id="challenge-note"
              v-model="note"
              rows="2"
              maxlength="280"
              class="mt-1 w-full resize-none rounded-md border-2 border-meadow-300 bg-white px-3 py-2 text-base text-forest-900 placeholder:text-ink-400 focus:border-forest-700 focus:outline-none"
              placeholder="I saw a heron!"
            />
            <p class="mt-1 text-sm text-forest-700">
              Don’t write where you live or your full name.
            </p>
            <p v-if="error" role="alert" class="mt-2 text-sm font-medium text-danger-700">
              {{ error }}
            </p>
            <button
              type="button"
              class="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-md bg-sun-400 font-display text-xl text-forest-900 shadow-[0_5px_0_var(--color-bark-500)] transition-transform active:translate-y-1 active:shadow-[0_1px_0_var(--color-bark-500)] disabled:opacity-60"
              :disabled="submitting"
              @click="emit('submit', note.trim())"
            >
              <LoaderCircle v-if="submitting" :size="20" class="animate-spin" aria-hidden="true" />
              {{ submitting ? 'Sending' : 'I did it!' }}
            </button>
            <p class="mt-2 text-center text-sm text-forest-700">
              A grown-up checks it, then the XP is yours.
            </p>
          </template>

          <p
            v-else-if="challenge.status === 'available'"
            class="rounded-md bg-meadow-100 px-4 py-3 text-base text-forest-900"
          >
            Ready to start.
          </p>

          <p
            v-else-if="challenge.status === 'pending'"
            class="flex items-start gap-3 rounded-md bg-sky-50 px-4 py-3 text-base text-sky-700"
          >
            <Hourglass :size="20" class="mt-0.5 shrink-0" aria-hidden="true" />
            {{
              readonly
                ? 'Waiting for you to approve it on the dashboard.'
                : 'Waiting for a grown-up to check. Your XP lands once they say yes.'
            }}
          </p>

          <p
            v-else-if="challenge.status === 'completed'"
            class="rounded-md bg-forest-900 px-4 py-3 text-base font-semibold text-white"
          >
            Done! {{ challenge.xp }} XP earned.
          </p>

          <p
            v-else
            class="flex items-start gap-3 rounded-md bg-meadow-200 px-4 py-3 text-base text-forest-900"
          >
            <Lock :size="20" class="mt-0.5 shrink-0" aria-hidden="true" />
            Reach level {{ region.unlockLevel }} to open {{ region.name }}.
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
