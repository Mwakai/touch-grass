import type { RouteLocationRaw } from 'vue-router'

type UserWithRole = {
  id?: string | number
  role?: string
}

export const getDefaultRouteForUser = (user?: UserWithRole | null): RouteLocationRaw => {
  if (!user) {
    return { name: 'login' }
  }

  if (user.role === 'kid') {
    if (user.id !== undefined && user.id !== null && user.id !== '') {
      return { name: 'kid-dashboard', params: { kidId: String(user.id) } }
    }

    return { name: 'kid-dashboard' }
  }

  return { name: 'dashboard' }
}
