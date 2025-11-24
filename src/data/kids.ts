export type KidStats = {
  challenges: number
  badges: number
  outdoorMinutes: number
}

export type KidQuickStat = {
  id: string
  label: string
  value: string
  description: string
}

export type KidChallenge = {
  id: string
  emoji: string
  title: string
  description: string
  points: number
  distance?: string
  status: 'active' | 'completed' | 'locked'
}

export type KidBadge = {
  id: string
  name: string
  emoji: string
}

export type KidProfile = {
  id: string
  name: string
  age: number
  points: number
  avatarGradient: string
  avatarColor?: string // Alias for avatarGradient for backward compatibility
  avatarAccent: string
  stats: KidStats
  quickStats: KidQuickStat[]
  challenges: KidChallenge[]
  badges: KidBadge[]
}

export const mockKids: KidProfile[] = [
  {
    id: 'kid-1',
    name: 'Liam',
    age: 9,
    points: 1280,
    avatarGradient: 'from-pink-500 via-rose-400 to-orange-400',
    avatarAccent: 'bg-orange-100 text-orange-600',
    stats: {
      challenges: 24,
      badges: 12,
      outdoorMinutes: 340
    },
    quickStats: [
      { id: 'today', label: 'Today', value: '42 min', description: 'Outdoor minutes' },
      { id: 'week', label: 'This Week', value: '8', description: 'Challenges' },
      { id: 'total', label: 'Total', value: '1,280 pts', description: 'All-time points' }
    ],
    challenges: [
      {
        id: 'challenge-1',
        emoji: '🌳',
        title: 'Tree Explorer',
        description: 'Identify 3 different types of trees nearby.',
        points: 120,
        distance: '0.3 mi away',
        status: 'active'
      },
      {
        id: 'challenge-2',
        emoji: '🚴',
        title: 'Park Ride',
        description: 'Cycle around the park loop twice.',
        points: 90,
        status: 'completed'
      },
      {
        id: 'challenge-3',
        emoji: '🔭',
        title: 'Nature Scout',
        description: 'Spot 5 unique wildlife tracks.',
        points: 150,
        distance: '1.2 mi away',
        status: 'locked'
      }
    ],
    badges: [
      { id: 'badge-1', name: 'Trail Blazer', emoji: '🥾' },
      { id: 'badge-2', name: 'Star Collector', emoji: '⭐' },
      { id: 'badge-3', name: 'Bike Champ', emoji: '🚴' },
      { id: 'badge-4', name: 'Eco Hero', emoji: '🌿' }
    ]
  },
  {
    id: 'kid-2',
    name: 'Maya',
    age: 11,
    points: 1540,
    avatarGradient: 'from-emerald-500 via-teal-400 to-cyan-400',
    avatarAccent: 'bg-emerald-100 text-emerald-600',
    stats: {
      challenges: 31,
      badges: 16,
      outdoorMinutes: 410
    },
    quickStats: [
      { id: 'today', label: 'Today', value: '55 min', description: 'Outdoor minutes' },
      { id: 'week', label: 'This Week', value: '11', description: 'Challenges' },
      { id: 'total', label: 'Total', value: '1,540 pts', description: 'All-time points' }
    ],
    challenges: [
      {
        id: 'challenge-4',
        emoji: '🧭',
        title: 'Compass Quest',
        description: 'Navigate to 3 different trail markers.',
        points: 110,
        status: 'active'
      },
      {
        id: 'challenge-5',
        emoji: '📸',
        title: 'Photo Safari',
        description: 'Capture 5 nature photos.',
        points: 95,
        status: 'active'
      },
      {
        id: 'challenge-6',
        emoji: '🏕️',
        title: 'Camp Ready',
        description: 'Pack the perfect eco-friendly camping bag.',
        points: 140,
        status: 'completed'
      }
    ],
    badges: [
      { id: 'badge-5', name: 'Sky Watcher', emoji: '🔭' },
      { id: 'badge-6', name: 'Forest Friend', emoji: '🦊' },
      { id: 'badge-7', name: 'Path Finder', emoji: '🧭' }
    ]
  }
]

export const getKidById = (kidId: string) => mockKids.find((kid) => kid.id === kidId)
