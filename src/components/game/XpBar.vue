<script setup lang="ts">
import { computed } from 'vue'

/** Progress through the current level, from levelXp up to nextLevelXp. */
const props = defineProps<{
  xp: number
  levelXp: number
  nextLevelXp: number
  level: number
}>()

const intoLevel = computed(() => props.xp - props.levelXp)
const levelSize = computed(() => props.nextLevelXp - props.levelXp)
const percent = computed(() =>
  Math.min(100, Math.max(0, (intoLevel.value / levelSize.value) * 100)),
)
const toGo = computed(() => props.nextLevelXp - props.xp)
</script>

<template>
  <div>
    <div
      class="h-4 overflow-hidden rounded-full border-2 border-bark-500 bg-meadow-50"
      role="progressbar"
      :aria-valuemin="0"
      :aria-valuemax="levelSize"
      :aria-valuenow="intoLevel"
      :aria-label="`XP towards level ${level + 1}`"
    >
      <div
        class="h-full rounded-full bg-sun-400 transition-[width] duration-700"
        :style="{ width: `${percent}%` }"
      />
    </div>
    <p class="mt-1 text-sm text-forest-700">
      <span class="font-semibold tabular-nums">{{ toGo.toLocaleString() }} XP</span>
      to level {{ level + 1 }}
    </p>
  </div>
</template>
