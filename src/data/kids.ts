import type { Component } from 'vue'
import {
  Bike,
  Binoculars,
  Camera,
  Compass,
  Footprints,
  Leaf,
  PawPrint,
  Star,
  Telescope,
  Tent,
  Trees,
} from 'lucide-vue-next'

export const activityIcons = {
  trees: Trees,
  bike: Bike,
  binoculars: Binoculars,
  compass: Compass,
  camera: Camera,
  tent: Tent,
  footprints: Footprints,
  star: Star,
  leaf: Leaf,
  telescope: Telescope,
  paw: PawPrint,
} satisfies Record<string, Component>

export type ActivityIcon = keyof typeof activityIcons

export type KidStats = {
  challenges: number
  badges: number
  outdoorMinutes: number
}

export type KidChallenge = {
  id: string
  icon: ActivityIcon
  title: string
  description: string
  points: number
  distance?: string
  status: 'active' | 'completed' | 'locked'
}

export type KidBadge = {
  id: string
  name: string
  icon: ActivityIcon
}

export type KidProfile = {
  id: string
  name: string
  age: number
  points: number
  avatarColor: string
  stats: KidStats
  challenges: KidChallenge[]
  badges: KidBadge[]
}

export const mockKids: KidProfile[] = [
  {
    id: 'kid-1',
    name: 'Liam',
    age: 9,
    points: 1280,
    avatarColor: 'clay',
    stats: {
      challenges: 24,
      badges: 12,
      outdoorMinutes: 340,
    },
    challenges: [
      {
        id: 'challenge-1',
        icon: 'trees',
        title: 'Tree Explorer',
        description: 'Identify 3 different types of trees nearby.',
        points: 120,
        distance: '0.3 mi away',
        status: 'active',
      },
      {
        id: 'challenge-2',
        icon: 'bike',
        title: 'Park Ride',
        description: 'Cycle around the park loop twice.',
        points: 90,
        status: 'completed',
      },
      {
        id: 'challenge-3',
        icon: 'binoculars',
        title: 'Nature Scout',
        description: 'Spot 5 unique wildlife tracks.',
        points: 150,
        distance: '1.2 mi away',
        status: 'locked',
      },
    ],
    badges: [
      { id: 'badge-1', name: 'Trail Blazer', icon: 'footprints' },
      { id: 'badge-2', name: 'Star Collector', icon: 'star' },
      { id: 'badge-3', name: 'Bike Champ', icon: 'bike' },
      { id: 'badge-4', name: 'Eco Hero', icon: 'leaf' },
    ],
  },
  {
    id: 'kid-2',
    name: 'Maya',
    age: 11,
    points: 1540,
    avatarColor: 'forest',
    stats: {
      challenges: 31,
      badges: 16,
      outdoorMinutes: 410,
    },
    challenges: [
      {
        id: 'challenge-4',
        icon: 'compass',
        title: 'Compass Quest',
        description: 'Navigate to 3 different trail markers.',
        points: 110,
        status: 'active',
      },
      {
        id: 'challenge-5',
        icon: 'camera',
        title: 'Photo Safari',
        description: 'Capture 5 nature photos.',
        points: 95,
        status: 'active',
      },
      {
        id: 'challenge-6',
        icon: 'tent',
        title: 'Camp Ready',
        description: 'Pack the perfect eco-friendly camping bag.',
        points: 140,
        status: 'completed',
      },
    ],
    badges: [
      { id: 'badge-5', name: 'Sky Watcher', icon: 'telescope' },
      { id: 'badge-6', name: 'Forest Friend', icon: 'paw' },
      { id: 'badge-7', name: 'Path Finder', icon: 'compass' },
    ],
  },
]

export const getKidById = (kidId: string) => mockKids.find((kid) => kid.id === kidId)
