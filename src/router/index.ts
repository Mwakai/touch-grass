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
  const redirectTo = (target: ReturnType<typeof getDefaultRouteForUser>) => {
    const resolvedTarget = router.resolve(target)

    if (resolvedTarget.fullPath === to.fullPath) {
      next()
      return true
    }

    next(target)
    return true
  }

  if (to.meta?.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta?.requiresGuest && authStore.isAuthenticated) {
    redirectTo(getDefaultRouteForUser(authStore.user))
    return
  }

  const allowedRoles = to.meta?.allowedRoles
  if (allowedRoles && authStore.user && !allowedRoles.includes(authStore.user.role)) {
    redirectTo(getDefaultRouteForUser(authStore.user))
    return
  }

  next()
})

export default router
