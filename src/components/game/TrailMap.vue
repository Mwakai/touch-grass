<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { Check, Hourglass, Lock, Sparkles } from '@lucide/vue'
import { gameIcon, type GameChallenge, type GameRegion } from '@/data/game'

/**
 * The adventure as a trail map. The trail climbs from the bottom of the page
 * (Backyard) to the top (The Summit), so regions are drawn in reverse and the
 * page scrolls to the kid's "you are here" pin on load.
 */
const props = defineProps<{
  regions: GameRegion[]
  /** Initial shown in the "you are here" pin; no pin when omitted. */
  pinLabel?: string
}>()

const emit = defineEmits<{ select: [challenge: GameChallenge, region: GameRegion] }>()

// Map geometry. Heights are px; x positions are on a 320-wide grid that
// stretches to the column width, so the map fits narrow phones.
const width = 320
const rowHeight = 112
const nodeSize = 64
const lanes = [160, 252, 160, 68]

type Waypoint = { challenge: GameChallenge; x: number; y: number }

const layout = (region: GameRegion) => {
  const height = region.challenges.length * rowHeight
  const points: Waypoint[] = region.challenges.map((challenge, i) => ({
    challenge,
    x: lanes[i % lanes.length]!,
    // First challenge at the bottom
    y: height - rowHeight / 2 - i * rowHeight,
  }))

  // Enter at the bottom centre, wind through each waypoint, leave at the top centre
  const stops = [{ x: width / 2, y: height }, ...points, { x: width / 2, y: 0 }]
  let path = `M ${stops[0]!.x} ${stops[0]!.y}`
  for (let i = 1; i < stops.length; i++) {
    const from = stops[i - 1]!
    const to = stops[i]!
    const bend = (from.y - to.y) / 2
    path += ` C ${from.x} ${from.y - bend}, ${to.x} ${to.y + bend}, ${to.x} ${to.y}`
  }

  return { height, points, path }
}

const trail = computed(() =>
  [...props.regions].reverse().map((region) => ({ region, ...layout(region) })),
)

// The pin sits on the first open challenge along the trail
const pinnedId = computed(() => {
  for (const region of props.regions) {
    const next = region.challenges.find((c) => c.status === 'available')
    if (next) return next.id
  }
  return null
})

const pinEl = ref<HTMLElement | null>(null)
const setPin = (el: unknown) => {
  if (el) pinEl.value = el as HTMLElement
}

const leftOf = (x: number) => `calc(${(x / width) * 100}% - 56px)`

onMounted(async () => {
  await nextTick()
  pinEl.value?.scrollIntoView({ block: 'center' })
})

const nodeTone = {
  completed: 'bg-forest-900 text-white shadow-[0_4px_0_var(--color-forest-700)]',
  available:
    'bg-white text-forest-900 border-4 border-sun-400 shadow-[0_4px_0_var(--color-bark-500)] active:translate-y-1 active:shadow-none',
  pending: 'bg-sky-50 text-sky-700 border-4 border-sky-500 shadow-[0_4px_0_var(--color-sky-700)]',
  locked: 'bg-meadow-200 text-bark-300',
} satisfies Record<GameChallenge['status'], string>

const statusLabel = {
  completed: 'done',
  available: 'ready to start',
  pending: 'waiting for a grown-up',
  locked: 'locked',
} satisfies Record<GameChallenge['status'], string>
</script>

<template>
  <div class="topo mx-auto w-full max-w-[22rem] rounded-lg px-2 py-6">
    <section
      v-for="{ region, height, points, path } in trail"
      :key="region.id"
      :aria-labelledby="`region-${region.id}`"
      :class="!region.unlocked && 'grayscale-[60%]'"
    >
      <!-- Signpost for the region, standing on the trail -->
      <div class="relative flex flex-col items-center pb-2 pt-4">
        <div
          class="relative z-10 max-w-full rounded-sm bg-bark-500 px-4 py-2 text-center shadow-[0_3px_0_var(--color-bark-700)]"
        >
          <h2 :id="`region-${region.id}`" class="font-display text-xl text-meadow-50">
            {{ region.name }}
          </h2>
          <p class="text-sm font-medium text-meadow-100">
            <template v-if="region.unlocked">
              {{ region.completedCount }} of {{ region.total }} done
            </template>
            <template v-else>
              <Lock :size="12" class="-mt-0.5 inline" aria-hidden="true" />
              Opens at level {{ region.unlockLevel }}
            </template>
          </p>
        </div>
        <span class="h-4 w-2 rounded-b-sm bg-bark-700" aria-hidden="true" />
        <p class="mt-2 max-w-60 text-center text-sm text-forest-700">{{ region.description }}</p>
      </div>

      <div class="relative mx-auto max-w-80" :style="{ height: `${height}px` }">
        <svg
          class="absolute inset-0 size-full"
          :viewBox="`0 0 ${width} ${height}`"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            :d="path"
            fill="none"
            stroke-width="6"
            stroke-linecap="round"
            stroke-dasharray="2 14"
            vector-effect="non-scaling-stroke"
            :class="region.unlocked ? 'stroke-bark-500' : 'stroke-bark-300'"
          />
        </svg>

        <ol class="contents">
          <li
            v-for="point in [...points].reverse()"
            :key="point.challenge.id"
            class="absolute flex w-28 flex-col items-center"
            :style="{ left: leftOf(point.x), top: `${point.y - nodeSize / 2}px` }"
          >
            <!-- You are here -->
            <span
              v-if="pinLabel && point.challenge.id === pinnedId"
              :ref="setPin"
              class="absolute -top-11 z-10 flex animate-bob flex-col items-center"
            >
              <span
                class="flex size-9 items-center justify-center rounded-full border-[3px] border-white bg-sun-400 font-display text-lg text-forest-900 shadow-md"
              >
                {{ pinLabel }}
              </span>
              <span
                class="-mt-1 size-0 border-x-[6px] border-t-8 border-x-transparent border-t-white"
              />
              <span class="sr-only">You are here</span>
            </span>

            <button
              type="button"
              class="relative flex items-center justify-center rounded-full transition-transform"
              :class="nodeTone[point.challenge.status]"
              :style="{ width: `${nodeSize}px`, height: `${nodeSize}px` }"
              :aria-label="`${point.challenge.title}, ${statusLabel[point.challenge.status]}`"
              @click="emit('select', point.challenge, region)"
            >
              <Lock v-if="point.challenge.status === 'locked'" :size="24" aria-hidden="true" />
              <component
                :is="gameIcon(point.challenge.icon)"
                v-else
                :size="28"
                aria-hidden="true"
              />

              <span
                v-if="point.challenge.status === 'completed'"
                class="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-sun-400 text-forest-900"
                aria-hidden="true"
              >
                <Check :size="14" stroke-width="3" />
              </span>
              <span
                v-else-if="point.challenge.status === 'pending'"
                class="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-sky-500 text-white"
                aria-hidden="true"
              >
                <Hourglass :size="12" stroke-width="3" />
              </span>
              <span
                v-else-if="point.challenge.status === 'available' && point.challenge.recommended"
                class="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-forest-900 text-sun-400"
                aria-hidden="true"
              >
                <Sparkles :size="12" stroke-width="2.5" />
              </span>
            </button>

            <span
              class="mt-1.5 rounded-sm bg-meadow-50/90 px-1.5 text-center text-xs font-semibold leading-tight"
              :class="point.challenge.status === 'locked' ? 'text-ink-500' : 'text-forest-900'"
              aria-hidden="true"
            >
              {{ point.challenge.title }}
            </span>
          </li>
        </ol>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Contour lines, like a printed trail map */
.topo {
  background-color: var(--color-meadow-100);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Cg fill='none' stroke='%23cfe5b0' stroke-width='1.5'%3E%3Cpath d='M-20 60 C40 20 80 100 140 60 S220 20 260 60'/%3E%3Cpath d='M-20 90 C40 50 80 130 140 90 S220 50 260 90'/%3E%3Cellipse cx='60' cy='180' rx='44' ry='26'/%3E%3Cellipse cx='60' cy='180' rx='24' ry='13'/%3E%3Cpath d='M120 240 C150 200 210 210 240 170'/%3E%3C/g%3E%3C/svg%3E");
}
</style>
