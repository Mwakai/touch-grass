export type AvatarColor = {
  id: string
  label: string
  hex: string
}

export const avatarColors: AvatarColor[] = [
  { id: 'forest', label: 'Forest', hex: '#2f7f4a' },
  { id: 'moss', label: 'Moss', hex: '#5a7a1f' },
  { id: 'lake', label: 'Lake', hex: '#2b6f8f' },
  { id: 'clay', label: 'Clay', hex: '#b45a32' },
  { id: 'sun', label: 'Sun', hex: '#9a6b12' },
  { id: 'berry', label: 'Berry', hex: '#9c3f63' },
]

export const defaultAvatarColorId = 'forest'

// Kids created before the design system stored Tailwind gradient classes.
const legacyGradients: Record<string, string> = {
  'from-pink-500 via-rose-400 to-orange-400': 'berry',
  'from-emerald-500 via-lime-400 to-teal-400': 'forest',
  'from-emerald-500 via-teal-400 to-cyan-400': 'forest',
  'from-cyan-500 via-sky-400 to-blue-500': 'lake',
  'from-amber-500 via-orange-400 to-rose-400': 'clay',
  'from-indigo-500 via-purple-500 to-pink-500': 'moss',
  'from-fuchsia-500 via-purple-500 to-sky-500': 'sun',
  'from-blue-400 to-purple-500': 'lake',
}

export const resolveAvatarColor = (value?: string | null): AvatarColor => {
  const id = (value && legacyGradients[value]) || value || defaultAvatarColorId
  return avatarColors.find((color) => color.id === id) ?? avatarColors[0]!
}
