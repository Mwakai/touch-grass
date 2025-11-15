<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { mockKids } from '@/data/kids'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const parentName = computed(() => authStore.user?.name ?? 'Parent')
const kids = ref(mockKids)
const hasKids = computed(() => kids.value.length > 0)

const bottomNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏡', to: '/dashboard', action: null },
  { id: 'kids', label: 'Kids', icon: '🧒', to: '/dashboard', action: null },
  { id: 'add', label: 'Add Kid', icon: '➕', to: '/add-kid', action: null },
  { id: 'logout', label: 'Logout', icon: '🚪', to: null, action: 'logout' },
]

const handleLogout = async () => {
  try {
    await authStore.logout()
    console.log('Logout successful, redirecting to login')
    await router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    // Still redirect to login even if logout fails
    await router.push('/login')
  }
}

const openAddKid = () => {
  router.push({ name: 'add-kid' })
}

const openKid = (kidId: string) => {
  router.push({ name: 'kid-dashboard', params: { kidId } })
}

const isActiveNav = (path: string) => {
  return route.path === path
}

const handleNavClick = (item: any) => {
  if (item.action === 'logout') {
    handleLogout()
  } else if (item.to) {
    router.push(item.to)
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <header class="relative flex items-center gap-4 px-6 py-6 md:px-10">
      <div>
        <p class="text-sm text-slate-500">Parent Dashboard</p>
        <h1 class="text-2xl font-semibold">Hello, {{ parentName }}!</h1>
      </div>
      <div class="ml-auto flex items-center gap-3">
        <button
          class="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 md:inline-flex"
          @click="handleLogout"
        >
          Logout
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
          @click="openAddKid"
        >
          <span class="text-lg">+</span>
          Add Kid
        </button>
      </div>
    </header>

    <main class="px-6 pb-8 md:px-10">
      <section v-if="hasKids" class="grid gap-6 md:grid-cols-2">
        <article
          v-for="kid in kids"
          :key="kid.id"
          class="relative transform rounded-3xl bg-white p-6 shadow-lg shadow-slate-200 transition hover:-translate-y-1 hover:shadow-2xl"
          @click="openKid(kid.id)"
        >
          <div class="absolute right-6 top-6 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-600">
            {{ kid.points.toLocaleString() }} pts
          </div>
          <div class="flex items-center gap-4">
            <div
              class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-bold text-white"
              :class="kid.avatarGradient"
            >
              {{ kid.name.charAt(0) }}
            </div>
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-400">Explorer</p>
              <h2 class="text-xl font-semibold text-slate-900">{{ kid.name }}</h2>
              <p class="text-sm text-slate-500">{{ kid.age }} years old</p>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
            <div class="rounded-2xl bg-emerald-50 px-2 py-3">
              <p class="text-xs uppercase tracking-wide text-emerald-600">Challenges</p>
              <p class="text-lg font-bold text-slate-900">{{ kid.stats.challenges }}</p>
            </div>
            <div class="rounded-2xl bg-blue-50 px-2 py-3">
              <p class="text-xs uppercase tracking-wide text-blue-600">Badges</p>
              <p class="text-lg font-bold text-slate-900">{{ kid.stats.badges }}</p>
            </div>
            <div class="rounded-2xl bg-amber-50 px-2 py-3">
              <p class="text-xs uppercase tracking-wide text-amber-600">Outdoor</p>
              <p class="text-lg font-bold text-slate-900">{{ kid.stats.outdoorMinutes }}m</p>
            </div>
          </div>
        </article>
      </section>

      <section
        v-else
        class="flex flex-col items-center justify-center rounded-3xl bg-white py-16 text-center shadow-lg shadow-slate-200"
      >
        <div class="text-6xl">👨‍👩‍👧‍👦</div>
        <h2 class="mt-4 text-2xl font-semibold text-slate-900">Add your first kid to get started!</h2>
        <p class="mt-2 max-w-md text-sm text-slate-500">
          Track progress, celebrate wins, and inspire outdoor adventures together.
        </p>
        <button
          class="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
          @click="openAddKid"
        >
          <span class="text-lg">+</span>
          Add Kid
        </button>
      </section>
    </main>

    <nav class="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white px-6 py-3 shadow-2xl shadow-slate-900/10 md:hidden">
      <div class="flex items-center justify-between">
        <button
          v-for="item in bottomNavItems"
          :key="item.id"
          class="flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-1 text-xs font-medium transition"
          :class="item.to && isActiveNav(item.to) ? 'text-emerald-600' : 'text-slate-400'"
          @click="handleNavClick(item)"
        >
          <span class="text-lg">{{ item.icon }}</span>
          {{ item.label }}
        </button>
      </div>
    </nav>
  </div>
</template>
