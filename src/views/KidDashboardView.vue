<script setup lang="ts">
import { computed, ref, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Check, Clock, Lock, MapPin, Medal, SearchX, Star, Trophy } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import {
  activityIcons,
  getKidById,
  mockKids,
  type KidBadge,
  type KidChallenge,
  type KidStats,
} from '@/data/kids'
import AppPage from '@/components/layout/AppPage.vue'
import AppButton from '@/components/ui/AppButton.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import KidAvatar from '@/components/ui/KidAvatar.vue'
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'

interface KidData {
  id: string
  name: string
  age?: number
  avatarColor: string
  points: number
  stats: KidStats
  challenges: KidChallenge[]
  badges: KidBadge[]
}

const emptyStats: KidStats = { challenges: 0, badges: 0, outdoorMinutes: 0 }

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isParent = computed(() => authStore.user?.role === 'parent')
const kidId = computed(() => route.params.kidId as string | undefined)
// Parents fetch from the API; start in the loading state so the page never flashes "not found"
const isLoading = ref(isParent.value && !!kidId.value)
const error = ref<string | null>(null)
const fetchedKidData = ref<KidData | null>(null)

const fetchKidData = async () => {
  if (!kidId.value || !isParent.value) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const kidFromApi = await api.getKid(kidId.value)
    // Challenges and badges are not in the API yet, so they come from mock data
    const mockKid = getKidById(kidId.value) || mockKids[0]

    fetchedKidData.value = {
      id: kidFromApi.id,
      name: kidFromApi.name,
      age: kidFromApi.age,
      avatarColor: kidFromApi.avatarColor,
      points: kidFromApi.points ?? 0,
      stats: kidFromApi.stats ?? emptyStats,
      challenges: mockKid?.challenges || [],
      badges: mockKid?.badges || [],
    }
  } catch (err: unknown) {
    console.error('Failed to fetch kid:', err)
    error.value = err instanceof Error ? err.message : 'Could not load this kid.'
  } finally {
    isLoading.value = false
  }
}

const kid = computed((): KidData | undefined => {
  if (isParent.value) {
    return fetchedKidData.value ?? undefined
  }

  if (authStore.user?.role === 'kid') {
    const mockKid = kidId.value ? getKidById(kidId.value) : null
    if (mockKid) return mockKid

    return {
      id: String(authStore.user.id),
      name: authStore.user.name || authStore.user.email?.split('@')[0] || 'Explorer',
      age: authStore.user.age,
      avatarColor: '',
      points: 0,
      stats: emptyStats,
      challenges: mockKids[0]?.challenges || [],
      badges: [],
    }
  }

  return kidId.value ? getKidById(kidId.value) : mockKids[0]
})

watchEffect(() => {
  if (!authStore.user) {
    router.replace({ name: 'login' })
  }
})

onMounted(fetchKidData)

const today = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).format(new Date())

const stats = computed(() => [
  { label: 'Challenges', value: kid.value?.stats.challenges ?? 0, icon: Trophy },
  { label: 'Badges', value: kid.value?.stats.badges ?? 0, icon: Medal },
  { label: 'Minutes outside', value: kid.value?.stats.outdoorMinutes ?? 0, icon: Clock },
])

const challengeTone = {
  active: { card: 'bg-white shadow-sm', tile: 'bg-grass-50 text-grass-600', title: 'text-ink-900' },
  completed: { card: 'bg-white shadow-sm', tile: 'bg-grass-600 text-white', title: 'text-ink-900' },
  locked: { card: 'bg-ink-100', tile: 'bg-ink-200 text-ink-400', title: 'text-ink-500' },
} satisfies Record<KidChallenge['status'], Record<string, string>>

const pageTitle = computed(() => (isLoading.value ? 'Loading' : (kid.value?.name ?? 'Explorer')))
</script>

<template>
  <AppPage
    :title="pageTitle"
    :eyebrow="today"
    :back-to="isParent ? { name: 'dashboard' } : undefined"
    back-label="Dashboard"
  >
    <div v-if="isLoading" class="space-y-8" aria-busy="true" aria-label="Loading kid">
      <div class="rounded-lg bg-white p-5 shadow-sm">
        <div class="flex items-center gap-4">
          <SkeletonBlock class="size-16 rounded-full" />
          <div class="space-y-2">
            <SkeletonBlock class="h-5 w-24" />
            <SkeletonBlock class="h-4 w-32" />
          </div>
        </div>
        <div class="mt-5 grid grid-cols-3 gap-2">
          <SkeletonBlock v-for="n in 3" :key="n" class="h-16 rounded-md" />
        </div>
      </div>
      <div class="space-y-3">
        <SkeletonBlock class="h-6 w-40" />
        <SkeletonBlock v-for="n in 3" :key="n" class="h-24 rounded-lg" />
      </div>
    </div>

    <ErrorState v-else-if="error" :message="error" @retry="fetchKidData" />

    <div v-else-if="kid" class="space-y-8">
      <section class="animate-enter rounded-lg bg-white p-5 shadow-sm" aria-label="Summary">
        <div class="flex items-center gap-4">
          <KidAvatar :name="kid.name" :color="kid.avatarColor" size="lg" />
          <div class="min-w-0 flex-1">
            <p class="text-sm text-ink-500">{{ kid.age ? `${kid.age} years old` : 'Explorer' }}</p>
            <p class="flex items-center gap-1 text-xl font-semibold text-ink-900 tabular-nums">
              <Star :size="20" class="text-sun-700" aria-hidden="true" />
              {{ kid.points.toLocaleString() }}
              <span class="text-base font-medium text-ink-500">points</span>
            </p>
          </div>
        </div>

        <dl class="mt-5 grid grid-cols-3 gap-2">
          <div v-for="stat in stats" :key="stat.label" class="rounded-md bg-ink-50 p-3">
            <dt class="flex items-center gap-1 text-xs font-medium text-ink-500">
              <component
                :is="stat.icon"
                :size="14"
                class="shrink-0 text-grass-600"
                aria-hidden="true"
              />
              <span class="truncate">{{ stat.label }}</span>
            </dt>
            <dd class="mt-1 text-lg font-semibold text-ink-900 tabular-nums">
              {{ stat.value.toLocaleString() }}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="challenges-heading">
        <h2 id="challenges-heading" class="text-lg font-semibold text-ink-900">
          Today's challenges
        </h2>
        <ul class="mt-3 space-y-3">
          <li
            v-for="(challenge, index) in kid.challenges"
            :key="challenge.id"
            class="stagger flex animate-enter gap-4 rounded-lg p-4"
            :class="challengeTone[challenge.status].card"
            :style="{ '--i': index }"
          >
            <span
              class="flex size-11 shrink-0 items-center justify-center rounded-md"
              :class="challengeTone[challenge.status].tile"
            >
              <component :is="activityIcons[challenge.icon]" :size="20" aria-hidden="true" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-base font-semibold" :class="challengeTone[challenge.status].title">
                  {{ challenge.title }}
                </h3>
                <span
                  v-if="challenge.status === 'completed'"
                  class="inline-flex items-center gap-1 rounded-full bg-grass-50 px-2 py-0.5 text-xs font-medium text-grass-700"
                >
                  <Check :size="12" aria-hidden="true" />
                  Done
                </span>
                <span
                  v-else-if="challenge.status === 'locked'"
                  class="inline-flex items-center gap-1 rounded-full bg-ink-200 px-2 py-0.5 text-xs font-medium text-ink-500"
                >
                  <Lock :size="12" aria-hidden="true" />
                  Locked
                </span>
              </div>
              <p class="mt-1 text-sm text-ink-500">{{ challenge.description }}</p>
              <p class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
                <span class="inline-flex items-center gap-1 font-medium text-sun-700">
                  <Star :size="14" aria-hidden="true" />
                  {{ challenge.points }} pts
                </span>
                <span v-if="challenge.distance" class="inline-flex items-center gap-1">
                  <MapPin :size="14" aria-hidden="true" />
                  {{ challenge.distance }}
                </span>
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section aria-labelledby="badges-heading">
        <h2 id="badges-heading" class="text-lg font-semibold text-ink-900">Badges</h2>
        <ul v-if="kid.badges.length" class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <li
            v-for="(badge, index) in kid.badges"
            :key="badge.id"
            class="stagger flex animate-enter flex-col items-center rounded-lg bg-white p-4 text-center shadow-sm"
            :style="{ '--i': index }"
          >
            <span
              class="flex size-11 items-center justify-center rounded-full bg-sun-50 text-sun-700"
            >
              <component :is="activityIcons[badge.icon]" :size="20" aria-hidden="true" />
            </span>
            <p class="mt-2 text-sm font-medium text-ink-700">{{ badge.name }}</p>
          </li>
        </ul>
        <p v-else class="mt-3 rounded-lg bg-ink-100 px-4 py-6 text-center text-sm text-ink-500">
          No badges yet. Finishing challenges earns badges.
        </p>
      </section>
    </div>

    <div
      v-else
      class="flex animate-enter flex-col items-center rounded-lg bg-white px-6 py-12 text-center shadow-sm"
    >
      <SearchX :size="24" class="text-ink-400" aria-hidden="true" />
      <h2 class="mt-4 text-xl font-semibold text-ink-900">Kid not found</h2>
      <p class="mt-2 text-base text-ink-500">This profile may have been removed.</p>
      <AppButton v-if="isParent" class="mt-6" @click="router.push({ name: 'dashboard' })">
        Back to dashboard
      </AppButton>
    </div>
  </AppPage>
</template>
