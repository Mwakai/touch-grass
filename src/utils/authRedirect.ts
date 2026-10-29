import type { RouteLocationRaw } from 'vue-router'

type UserWithRole = {
  role?: string
}

export const getDefaultRouteForUser = (user?: UserWithRole | null): RouteLocationRaw => {
  if (!user) {
    return { name: 'login' }
  }

  // Kids always land on their own profile, which the dashboard loads from /kids/me
  if (user.role === 'kid') {
    return { name: 'kid-dashboard' }
  }

  return { name: 'dashboard' }
}
