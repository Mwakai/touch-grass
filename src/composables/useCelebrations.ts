import { computed, ref } from 'vue'
import type { GameBadge, GameSummary } from '@/data/game'

export type Celebration =
  | { kind: 'level'; key: string; level: number; unlockedRegion: string | null }
  | { kind: 'badge'; key: string; badge: GameBadge }

type Seen = { level: number; badges: string[] }

const read = (key: string): Seen | null => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as Seen) : null
  } catch {
    return null
  }
}

const write = (key: string, seen: Seen) => {
  try {
    localStorage.setItem(key, JSON.stringify(seen))
  } catch {
    // Private mode or storage blocked: celebrations just won't be remembered
  }
}

/**
 * Celebrate level-ups and new badges the kid hasn't seen yet. What they've
 * seen is remembered on this device; the first visit records the current
 * state without celebrating, so existing progress doesn't all pop at once.
 */
export const useCelebrations = (storageKey: string) => {
  const queue = ref<Celebration[]>([])

  const check = (summary: GameSummary) => {
    const earned = summary.badges.filter((badge) => badge.earned)
    const seen = read(storageKey)
    write(storageKey, { level: summary.level, badges: earned.map((badge) => badge.id) })
    if (!seen) return

    const next: Celebration[] = []
    if (summary.level > seen.level) {
      const opened = summary.regions.find(
        (region) => region.unlockLevel > seen.level && region.unlockLevel <= summary.level,
      )
      next.push({
        kind: 'level',
        key: `level-${summary.level}`,
        level: summary.level,
        unlockedRegion: opened?.name ?? null,
      })
    }
    for (const badge of earned) {
      if (!seen.badges.includes(badge.id)) {
        next.push({ kind: 'badge', key: `badge-${badge.id}`, badge })
      }
    }
    queue.value.push(...next)
  }

  const current = computed(() => queue.value[0] ?? null)
  const dismiss = () => queue.value.shift()

  return { current, check, dismiss }
}
