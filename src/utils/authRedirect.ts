import type { RouteLocationRaw } from 'vue-router'

type UserWithRole = {
  id?: string | number
  role?: string
}

export const getDefaultRouteForUser = (user?: UserWithRole | null): RouteLocationRaw => {
  if (!user) {
    console.log('getDefaultRouteForUser: No user, redirecting to login')
    return { name: 'login' }
  }

  console.log('getDefaultRouteForUser: User role is', user.role)

  if (user.role === 'kid') {
    if (user.id !== undefined && user.id !== null && user.id !== '') {
      console.log('getDefaultRouteForUser: Redirecting kid to kid-dashboard with ID', user.id)
      return { name: 'kid-dashboard', params: { kidId: String(user.id) } }
    }

    console.log('getDefaultRouteForUser: Redirecting kid to kid-dashboard without ID')
    return { name: 'kid-dashboard' }
  }

  console.log('getDefaultRouteForUser: Redirecting parent to dashboard')
  return { name: 'dashboard' }
}
