<script setup lang="ts">
import { computed } from 'vue'
import type { GameBadge } from '@/data/game'
import BadgePatch from './BadgePatch.vue'

const props = defineProps<{ badges: GameBadge[] }>()

// Earned patches first, newest first; then the ones still to earn
const ordered = computed(() => [
  ...props.badges
    .filter((badge) => badge.earned)
    .sort((a, b) => Date.parse(b.earnedAt ?? '') - Date.parse(a.earnedAt ?? '')),
  ...props.badges.filter((badge) => !badge.earned),
])

const earnedCount = computed(() => props.badges.filter((badge) => badge.earned).length)

const earnedOn = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(iso))
    : ''
</script>

<template>
  <section aria-labelledby="patches-heading" class="rounded-lg bg-meadow-50 px-4 py-6">
    <h2 id="patches-heading" class="font-display text-2xl text-forest-900">Patch collection</h2>
    <p class="text-sm text-forest-700">
      {{ earnedCount }} of {{ badges.length }} sewn on.
      {{ earnedCount === 0 ? 'Finish a challenge to earn your first.' : '' }}
    </p>

    <ul class="mt-6 grid grid-cols-3 gap-x-3 gap-y-6">
      <li
        v-for="(badge, index) in ordered"
        :key="badge.id"
        class="flex flex-col items-center text-center"
      >
        <BadgePatch
          :icon="badge.icon"
          :earned="badge.earned"
          :class="badge.earned && (index % 2 ? 'rotate-3' : '-rotate-3')"
        />
        <p
          class="mt-2 text-sm font-semibold leading-tight"
          :class="badge.earned ? 'text-forest-900' : 'text-ink-500'"
        >
          {{ badge.name }}
        </p>
        <p class="mt-0.5 text-xs text-forest-700">
          {{ badge.earned ? earnedOn(badge.earnedAt) : badge.description }}
        </p>
      </li>
    </ul>
  </section>
</template>
