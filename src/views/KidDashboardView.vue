<script setup lang="ts">
import { computed, ref, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import {
  getKidById,
  mockKids,
  type KidChallenge,
  type KidQuickStat,
  type KidStats,
} from '@/data/kids'

interface KidData {
  id: string
  name: string
  email?: string
  age: number
  avatarColor: string
  points: number
  stats: KidStats
  quickStats: KidQuickStat[]
  challenges: KidChallenge[]
  badges: { id: string; name: string; emoji: string }[]
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const kidId = computed(() => route.params.kidId as string | undefined)
const isLoading = ref(false)
const error = ref<string | null>(null)
const fetchedKidData = ref<KidData | null>(null)

// Fetch kid data from API when parent is viewing
const fetchKidData = async () => {
  if (!kidId.value || authStore.user?.role !== 'parent') {
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const kidFromApi = await api.getKid(kidId.value)

    // Transform API data to match KidData interface with mock challenges/badges
    const mockKid = getKidById(kidId.value) || mockKids[0]

    fetchedKidData.value = {
      id: kidFromApi.id,
      name: kidFromApi.name,
      age: kidFromApi.age,
      avatarColor: kidFromApi.avatarColor || 'from-blue-400 to-purple-500',
      points: kidFromApi.points ?? 0,
      stats: kidFromApi.stats ?? {
        challenges: 0,
        badges: 0,
        outdoorMinutes: 0,
      },
      quickStats: [
        { id: 'streak', label: 'Current Streak', value: '0 days', description: 'Keep going!' },
        {
          id: 'week',
          label: 'This Week',
          value: `${kidFromApi.points ?? 0} pts`,
          description: 'Points earned'
        },
        { id: 'rank', label: 'Rank', value: 'Explorer', description: 'Current level' },
      ],
      challenges: mockKid?.challenges || [],
      badges: mockKid?.badges || [],
    }
  } catch (err: unknown) {
    console.error('Failed to fetch kid:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load kid data'
  } finally {
    isLoading.value = false
  }
}

// Use logged-in user's data for the kid, or try to find in mock data, or use fetched data
const kid = computed((): KidData | undefined => {
  // If parent is viewing, use fetched data
  if (authStore.user?.role === 'parent' && fetchedKidData.value) {
    return fetchedKidData.value
  }

  // If the logged-in user is a kid, use their data
  if (authStore.user?.role === 'kid') {
    // Try to get kid from mock data, or create from auth user
    const mockKid = kidId.value ? getKidById(kidId.value) : null

    if (mockKid) {
      return {
        ...mockKid,
        avatarColor: mockKid.avatarColor || mockKid.avatarGradient,
      }
    }

    // Create kid object from logged-in user
    return {
      id: String(authStore.user.id),
      name: authStore.user.name || authStore.user.email?.split('@')[0] || 'Explorer',
      email: authStore.user.email,
      age: 10, // Default age, can be updated when you add it to backend
      avatarColor: 'from-blue-400 to-purple-500',
      points: 0,
      stats: {
        challenges: 0,
        badges: 0,
        outdoorMinutes: 0,
      },
      quickStats: [
        { id: 'streak', label: 'Current Streak', value: '0 days', description: 'Keep going!' },
        { id: 'week', label: 'This Week', value: '0 pts', description: 'Points earned' },
        { id: 'rank', label: 'Rank', value: 'Explorer', description: 'Current level' },
      ],
      challenges: mockKids[0]?.challenges || [],
      badges: [],
    }
  }

  // Fallback to mock data
  const fallbackKid = kidId.value ? getKidById(kidId.value) : mockKids[0]
  if (fallbackKid) {
    return {
      ...fallbackKid,
      avatarColor: fallbackKid.avatarColor || fallbackKid.avatarGradient,
    }
  }
  return undefined
})

watchEffect(() => {
  if (!authStore.user) {
    router.replace({ name: 'login' })
  }
})

onMounted(() => {
  fetchKidData()
})

const humanDate = computed(() => {
  const date = new Date()
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(date)
})

const humanTime = computed(() => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date())
})

const challengeCardClasses = (challenge: KidChallenge) => {
  switch (challenge.status) {
    case 'completed':
      return 'bg-emerald-50 border border-emerald-100 text-emerald-900'
    case 'locked':
      return 'bg-slate-100 border border-slate-200 text-slate-400'
    default:
      return 'bg-white border border-transparent text-slate-800 shadow-md shadow-slate-200'
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    await router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    // Still redirect to login even if logout fails
    await router.push('/login')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white pb-24">
    <header class="px-6 pt-6">
      <div class="flex items-center justify-between gap-3">
        <button
          v-if="authStore.user?.role === 'parent'"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          @click="router.push('/dashboard')"
        >
          <span class="text-base">←</span>
          Back to Dashboard
        </button>
        <div v-else></div>
        <button
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          @click="handleLogout"
        >
          <span class="text-base">🚪</span>
          Logout
        </button>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-16">
      <div class="text-center">
        <div
          class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"
        ></div>
        <p class="mt-2 text-sm text-slate-500">Loading kid data...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="mx-6 mt-6 rounded-3xl bg-rose-50 p-6 text-center">
      <p class="text-rose-600">{{ error }}</p>
      <button
        @click="fetchKidData"
        class="mt-4 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
      >
        Try Again
      </button>
    </div>

    <!-- Kid Dashboard Content -->
    <div v-else-if="kid">
      <section class="px-6 pb-8 pt-6">
        <div
          class="relative overflow-hidden rounded-[32px] bg-white/80 p-6 shadow-xl ring-1 ring-white/60 backdrop-blur"
        >
          <div class="flex flex-col gap-6 md:flex-row md:items-center">
            <div
              class="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br text-4xl font-bold text-white shadow-lg"
              :class="kid.avatarColor"
            >
              {{ kid.name.charAt(0) }}
            </div>
            <div class="flex-1">
              <p class="text-sm uppercase tracking-wide text-slate-400">Explorer</p>
              <h1 class="text-3xl font-bold text-slate-900">{{ kid.name }}</h1>
              <p class="text-sm text-slate-500">{{ kid.age }} years old · {{ humanDate }} · {{ humanTime }}</p>
            </div>
            <div
              class="flex flex-col items-start gap-2 rounded-2xl bg-emerald-500/10 px-6 py-4 text-emerald-600"
            >
              <div class="flex items-center gap-2 text-sm font-semibold">
                <span>⭐</span>
                Points
              </div>
              <p class="text-3xl font-bold text-emerald-600">
                {{ kid.points.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="px-6">
        <div class="no-scrollbar flex gap-4 overflow-x-auto pb-4">
          <article
            v-for="stat in kid.quickStats"
            :key="stat.id"
            class="min-w-[180px] flex-1 rounded-3xl bg-white px-5 py-4 shadow-lg shadow-slate-100 ring-1 ring-slate-100"
          >
            <p class="text-sm font-medium text-slate-500">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-slate-900">{{ stat.value }}</p>
            <p class="text-xs uppercase tracking-wide text-slate-400">{{ stat.description }}</p>
          </article>
        </div>
      </section>

      <main class="space-y-8 px-6 py-8">
        <section>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900">Today's Challenges</h2>
            <button class="text-sm font-semibold text-emerald-600">View all</button>
          </div>
          <div class="mt-5 space-y-4">
            <article
              v-for="challenge in kid.challenges"
              :key="challenge.id"
              class="flex items-start gap-4 rounded-3xl p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
              :class="challengeCardClasses(challenge)"
            >
              <div class="text-3xl">
                {{ challenge.emoji }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h3
                    class="text-lg font-semibold"
                    :class="challenge.status === 'locked' ? 'text-slate-400' : 'text-slate-900'"
                  >
                    {{ challenge.title }}
                  </h3>
                  <span
                    v-if="challenge.status === 'completed'"
                    class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-600"
                  >
                    ✅ Completed
                  </span>
                  <span
                    v-else-if="challenge.status === 'locked'"
                    class="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-500"
                  >
                    🔒 Locked
                  </span>
                </div>
                <p
                  class="mt-1 text-sm"
                  :class="challenge.status === 'locked' ? 'text-slate-400' : 'text-slate-500'"
                >
                  {{ challenge.description }}
                </p>
                <div class="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <span
                    class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-600"
                  >
                    ⭐ {{ challenge.points }} pts
                  </span>
                  <span
                    v-if="challenge.distance"
                    class="inline-flex items-center gap-1 text-slate-500"
                  >
                    📍 {{ challenge.distance }}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900">My Badges</h2>
            <button class="text-sm font-semibold text-emerald-600">View all</button>
          </div>
          <div v-if="kid.badges && kid.badges.length > 0" class="no-scrollbar mt-4 flex gap-4 overflow-x-auto pb-2">
            <div
              v-for="badge in kid.badges"
              :key="badge.id"
              class="min-w-[120px] rounded-2xl bg-white px-4 py-5 text-center shadow-md shadow-slate-100 ring-1 ring-slate-100"
            >
              <div class="text-3xl">{{ badge.emoji }}</div>
              <p class="mt-2 text-sm font-semibold text-slate-700">{{ badge.name }}</p>
            </div>
          </div>
          <div v-else class="mt-4 rounded-2xl bg-slate-50 p-8 text-center">
            <p class="text-slate-400">No badges earned yet. Complete challenges to earn badges!</p>
          </div>
        </section>
      </main>

      <button
        class="fixed bottom-28 right-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-3xl text-white shadow-2xl shadow-emerald-500/30 transition hover:scale-105"
      >
        📷
      </button>
    </div>

    <!-- No Kid Found State -->
    <div v-else class="mx-6 mt-6 rounded-3xl bg-slate-50 p-8 text-center">
      <div class="text-6xl">🔍</div>
      <h2 class="mt-4 text-2xl font-semibold text-slate-900">Kid Not Found</h2>
      <p class="mt-2 text-sm text-slate-500">
        We couldn't find the kid you're looking for.
      </p>
      <button
        @click="router.push('/dashboard')"
        class="mt-6 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
      >
        Back to Dashboard
      </button>
    </div>
  </div>
</template>
