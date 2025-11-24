<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api, type Kid } from '@/services/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const parentName = computed(() => authStore.user?.name ?? 'Parent')
const kids = ref<Kid[]>([])
const hasKids = computed(() => kids.value.length > 0)
const isLoading = ref(true)
const error = ref<string | null>(null)

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

const openKid = (kid: Kid) => {
  const kidId = kid.id || (kid as any)._id
  if (kidId) {
    router.push({ name: 'kid-dashboard', params: { kidId } })
  }
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

const fetchKids = async () => {
  isLoading.value = true
  error.value = null

  try {
    kids.value = await api.getKids()
  } catch (err: any) {
    console.error('Failed to fetch kids:', err)
    error.value = err.message || 'Failed to load kids'
  } finally {
    isLoading.value = false
  }
}

const handleEditKid = (kid: Kid) => {
  console.log('Edit kid clicked:', kid)
  console.log('Full kid object:', JSON.stringify(kid, null, 2))
  const kidId = kid.id || (kid as any)._id

  if (!kidId) {
    console.error('No kid ID found:', kid)
    alert('Cannot edit kid - missing ID')
    return
  }

  console.log('Navigating to edit with kidId:', kidId)
  router.push({ name: 'edit-kid', params: { kidId } })
}

const handleDeleteKid = async (kidId: string, kidName: string) => {
  if (!confirm(`Are you sure you want to delete ${kidName}? This action cannot be undone.`)) {
    return
  }

  try {
    await api.deleteKid(kidId)
    // Refresh the kids list
    await fetchKids()
  } catch (err: any) {
    console.error('Failed to delete kid:', err)
    alert(err.message || 'Failed to delete kid')
  }
}

onMounted(() => {
  fetchKids()
})
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
      <div v-if="isLoading" class="flex items-center justify-center py-16">
        <div class="text-center">
          <div
            class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"
          ></div>
          <p class="mt-2 text-sm text-slate-500">Loading kids...</p>
        </div>
      </div>

      <div v-else-if="error" class="rounded-3xl bg-rose-50 p-6 text-center">
        <p class="text-rose-600">{{ error }}</p>
        <button
          @click="fetchKids"
          class="mt-4 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          Try Again
        </button>
      </div>

      <section v-else-if="hasKids" class="grid gap-6 md:grid-cols-2">
        <article
          v-for="kid in kids"
          :key="kid.id"
          class="relative transform rounded-3xl bg-white p-6 shadow-lg shadow-slate-200 transition hover:-translate-y-1 hover:shadow-2xl"
        >
          <div class="absolute right-6 top-6 flex items-center gap-2">
            <div
              class="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-600"
            >
              {{ (kid.points ?? 0).toLocaleString() }} pts
            </div>
            <button
              @click.stop="handleEditKid(kid)"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition hover:bg-blue-200"
              title="Edit kid"
            >
              ✏️
            </button>
            <button
              @click.stop="handleDeleteKid(kid.id || (kid as any)._id, kid.name)"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600 transition hover:bg-rose-200"
              title="Delete kid"
            >
              🗑️
            </button>
          </div>
          <div class="flex items-center gap-4" @click="openKid(kid.id)">
            <div
              class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-bold text-white cursor-pointer"
              :class="kid.avatarColor"
            >
              {{ kid.name.charAt(0) }}
            </div>
            <div class="cursor-pointer">
              <p class="text-xs uppercase tracking-wide text-slate-400">Explorer</p>
              <h2 class="text-xl font-semibold text-slate-900">{{ kid.name }}</h2>
              <p class="text-sm text-slate-500">{{ kid.age }} years old</p>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-3 gap-3 text-center text-sm" @click="openKid(kid.id)">
            <div class="rounded-2xl bg-emerald-50 px-2 py-3 cursor-pointer">
              <p class="text-xs uppercase tracking-wide text-emerald-600">Challenges</p>
              <p class="text-lg font-bold text-slate-900">{{ kid.stats?.challenges ?? 0 }}</p>
            </div>
            <div class="rounded-2xl bg-blue-50 px-2 py-3 cursor-pointer">
              <p class="text-xs uppercase tracking-wide text-blue-600">Badges</p>
              <p class="text-lg font-bold text-slate-900">{{ kid.stats?.badges ?? 0 }}</p>
            </div>
            <div class="rounded-2xl bg-amber-50 px-2 py-3 cursor-pointer">
              <p class="text-xs uppercase tracking-wide text-amber-600">Outdoor</p>
              <p class="text-lg font-bold text-slate-900">{{ kid.stats?.outdoorMinutes ?? 0 }}m</p>
            </div>
          </div>
        </article>
      </section>

      <section
        v-else-if="!isLoading && !error"
        class="flex flex-col items-center justify-center rounded-3xl bg-white py-16 text-center shadow-lg shadow-slate-200"
      >
        <div class="text-6xl">👨‍👩‍👧‍👦</div>
        <h2 class="mt-4 text-2xl font-semibold text-slate-900">
          Add your first kid to get started!
        </h2>
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

    <nav
      class="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white px-6 py-3 shadow-2xl shadow-slate-900/10 md:hidden"
    >
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
