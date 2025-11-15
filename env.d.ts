/// <reference types="vite/client" />

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresGuest?: boolean
    requiresAuth?: boolean
    allowedRoles?: string[]
  }
}
