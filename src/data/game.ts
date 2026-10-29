import type { Component } from 'vue'
import {
  Bike,
  Bird,
  Bug,
  Camera,
  Cloud,
  Compass,
  Fish,
  Flag,
  Flame,
  Flower2,
  Footprints,
  Leaf,
  Map,
  Mountain,
  Palette,
  PawPrint,
  Star,
  Sun,
  Telescope,
  Tent,
  Trees,
  Volleyball,
  WavesHorizontal,
} from '@lucide/vue'

/**
 * Shapes returned by /api/game. The challenge catalogue and the rules live in
 * the backend (src/game), so the app only draws what it is sent.
 */

export type ChallengeStatus = 'locked' | 'available' | 'pending' | 'completed'

export type GameChallenge = {
  id: string
  title: string
  description: string
  icon: string
  category: string
  xp: number
  minutes: number
  status: ChallengeStatus
  recommended: boolean
  completionId?: string
}

export type GameRegion = {
  id: string
  name: string
  description: string
  unlockLevel: number
  unlocked: boolean
  completedCount: number
  total: number
  challenges: GameChallenge[]
}

export type GameBadge = {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedAt: string | null
}

export type GameSummary = {
  xp: number
  level: number
  levelXp: number
  nextLevelXp: number
  streak: { current: number; best: number }
  stats: { completed: number; pending: number; badges: number; outdoorMinutes: number }
  badges: GameBadge[]
  regions: GameRegion[]
}

export type PendingCompletion = {
  id: string
  note?: string
  submittedAt: string
  kid: { id: string; name: string; avatarColor: string }
  challenge: { id: string; title: string; description: string; icon: string; xp: number }
}

const icons: Record<string, Component> = {
  bike: Bike,
  bird: Bird,
  bug: Bug,
  camera: Camera,
  cloud: Cloud,
  compass: Compass,
  fish: Fish,
  flag: Flag,
  flame: Flame,
  flower: Flower2,
  footprints: Footprints,
  leaf: Leaf,
  map: Map,
  mountain: Mountain,
  palette: Palette,
  paw: PawPrint,
  star: Star,
  sun: Sun,
  telescope: Telescope,
  tent: Tent,
  trees: Trees,
  volleyball: Volleyball,
  waves: WavesHorizontal,
}

/** Icon for a catalogue icon key; new keys the app doesn't know yet get a star. */
export const gameIcon = (key: string): Component => icons[key] ?? Star
