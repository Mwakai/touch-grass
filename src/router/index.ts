import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getDefaultRouteForUser } from '@/utils/authRedirect'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/auth/SignupView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['parent'] },
    },
    {
      path: '/add-kid',
      name: 'add-kid',
      component: () => import('@/views/AddKidView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['parent'] },
    },
    {
      path: '/kids/:kidId?',
      name: 'kid-dashboard',
      component: () => import('@/views/KidDashboardView.vue'),
      props: true,
      meta: { requiresAuth: true, allowedRoles: ['kid'] },
    },
  ],
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  console.log('Navigation guard:', {
    to: to.name,
    from: from.name,
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    requiresAuth: to.meta?.requiresAuth,
    requiresGuest: to.meta?.requiresGuest,
    allowedRoles: to.meta?.allowedRoles
  })

  const redirectTo = (target: ReturnType<typeof getDefaultRouteForUser>) => {
    const resolvedTarget = router.resolve(target)

    if (resolvedTarget.fullPath === to.fullPath) {
      console.log('Already at target route, allowing navigation')
      next()
      return true
    }

    console.log('Redirecting to:', target)
    next(target)
    return true
  }

  if (to.meta?.requiresAuth && !authStore.isAuthenticated) {
    console.log('Route requires auth but user not authenticated, redirecting to login')
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta?.requiresGuest && authStore.isAuthenticated) {
    console.log('Route requires guest but user authenticated, redirecting to default route')
    redirectTo(getDefaultRouteForUser(authStore.user))
    return
  }

  const allowedRoles = to.meta?.allowedRoles
  if (allowedRoles && authStore.user && !allowedRoles.includes(authStore.user.role)) {
    console.log('User role not allowed for this route, redirecting to default route')
    redirectTo(getDefaultRouteForUser(authStore.user))
    return
  }

  console.log('Navigation allowed')
  next()
})

export default router
