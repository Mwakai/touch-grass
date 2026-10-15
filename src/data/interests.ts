import type { Component } from 'vue'
import { Bike, Leaf, Map, Palette, Volleyball } from 'lucide-vue-next'

export type Interest = {
  id: string
  label: string
  icon: Component
}

// TODO: interests should come from the backend, or be editable by the parent
export const interestOptions: Interest[] = [
  { id: 'football', label: 'Football', icon: Volleyball },
  { id: 'cycling', label: 'Cycling', icon: Bike },
  { id: 'nature', label: 'Nature', icon: Leaf },
  { id: 'art', label: 'Art', icon: Palette },
  { id: 'exploring', label: 'Exploring', icon: Map },
]
