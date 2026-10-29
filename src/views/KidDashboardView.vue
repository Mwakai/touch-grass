<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Clock, Flame, SearchX } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { api, type Kid } from '@/services/api'
import type { GameChallenge, GameSummary } from '@/data/game'
import { useCelebrations } from '@/composables/useCelebrations'
import AppPage from '@/components/layout/AppPage.vue'
import AppButton from '@/components/ui/AppButton.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import CelebrationOverlay from '@/components/game/CelebrationOverlay.vue'
import ChallengeSheet from '@/components/game/ChallengeSheet.vue'
import LevelShield from '@/components/game/LevelShield.vue'
import PatchCollection from '@/components/game/PatchCollection.vue'
import TrailMap from '@/components/game/TrailMap.vue'
import XpBar from '@/components/game/XpBar.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isParent = computed(() => authStore.user?.role === 'parent')
const isKid = computed(() => authStore.user?.role === 'kid')
const kidId = computed(() => route.params.kidId as string | undefined)

// Start in the loading state so the page never flashes "not found"
const isLoading = ref(isKid.value || (isParent.value && !!kidId.value))
const error = ref<string | null>(null)
const kid = ref<Kid | null>(null)
const summary = ref<GameSummary | null>(null)

const celebrations = useCelebrations(`touch-grass:seen:${authStore.user?.id ?? 'kid'}`)

const load = async ({ quiet = false } = {}) => {
  // Parents open a kid by id; kids always see their own linked profile
  const requests = isKid.value
    ? () => Promise.all([api.getMyKid(), api.getMyAdventure()])
    : isParent.value && kidId.value
      ? () =>
          Promise.all([
            api.getKid(kidId.value as string),
            api.getKidAdventure(kidId.value as string),
          ])
      : null

  if (!requests) {
    isLoading.value = false
    return
  }

  if (!quiet) {
    isLoading.value = true
    error.value = null
  }

  try {
    const [profile, adventure] = await requests()
    kid.value = profile
    summary.value = adventure
    if (isKid.value) celebrations.check(adventure)
  } catch (err: unknown) {
    console.error('Failed to load adventure:', err)
    if (quiet) return
    const message = err instanceof Error ? err.message : 'Could not load the adventure.'
    // An unlinked kid account gets a 404; show the "not found" state instead of a retry
    if (!(isKid.value && /not found/i.test(message))) {
      error.value = message
    }
  } finally {
    isLoading.value = false
  }
}

// Approvals happen on the parent's phone, so check again when the kid comes back
const onVisible = () => {
  if (document.visibilityState === 'visible' && summary.value) load({ quiet: true })
}

onMounted(() => {
  load()
  document.addEventListener('visibilitychange', onVisible)
})
onBeforeUnmount(() => document.removeEventListener('visibilitychange', onVisible))

watchEffect(() => {
  if (!authStore.user) {
    router.replace({ name: 'login' })
  }
})

const view = ref<'trail' | 'patches'>('trail')

// Challenge sheet
const selectedId = ref<string | null>(null)
const selected = computed(() => {
  for (const region of summary.value?.regions ?? []) {
    const challenge = region.challenges.find((c) => c.id === selectedId.value)
    if (challenge) return { challenge, region }
  }
  return null
})
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

const openChallenge = (challenge: GameChallenge) => {
  submitError.value = null
  selectedId.value = challenge.id
}

const submit = async (note: string) => {
  if (!selectedId.value) return
  isSubmitting.value = true
  submitError.value = null
  try {
    // The sheet stays open and switches to "waiting for a grown-up"
    summary.value = await api.submitChallenge(selectedId.value, note || undefined)
  } catch (err: unknown) {
    submitError.value = err instanceof Error ? err.message : 'That didn’t send. Try again.'
  } finally {
    isSubmitting.value = false
  }
}

const initial = computed(() => kid.value?.name.trim().charAt(0).toUpperCase() || '?')
const pageTitle = computed(() => (isLoading.value ? 'Loading' : (kid.value?.name ?? 'Explorer')))
const eyebrow = computed(() =>
  isParent.value ? `${kid.value?.name ?? 'Your kid'}’s adventure` : 'Your adventure',
)
</script>

<template>
  <AppPage
    :title="pageTitle"
    :eyebrow="eyebrow"
    tone="adventure"
    :back-to="isParent ? { name: 'dashboard' } : undefined"
    back-label="Dashboard"
  >
    <div v-if="isLoading" class="space-y-6" aria-busy="true" aria-label="Loading adventure">
      <SkeletonBlock class="h-24 rounded-lg" />
      <SkeletonBlock class="mx-auto h-[28rem] max-w-[22rem] rounded-lg" />
    </div>

    <ErrorState v-else-if="error" :message="error" @retry="load()" />

    <div v-else-if="kid && summary" class="space-y-4">
      <!-- Level, XP and streak stay in view while the map scrolls -->
      <section
        class="sticky top-2 z-20 flex items-center gap-4 rounded-lg bg-meadow-50 p-3 shadow-md"
        aria-label="Progress"
      >
        <LevelShield :level="summary.level" />
        <div class="min-w-0 flex-1">
          <XpBar
            :xp="summary.xp"
            :level="summary.level"
            :level-xp="summary.levelXp"
            :next-level-xp="summary.nextLevelXp"
          />
        </div>
        <dl class="flex shrink-0 flex-col items-end gap-1 text-sm font-semibold">
          <div
            class="flex items-center gap-1"
            :class="summary.streak.current ? 'text-sun-700' : 'text-ink-400'"
          >
            <dt class="sr-only">Day streak</dt>
            <Flame :size="16" aria-hidden="true" />
            <dd class="tabular-nums">
              {{ summary.streak.current }}
              <span class="font-medium">{{ summary.streak.current === 1 ? 'day' : 'days' }}</span>
            </dd>
          </div>
          <div class="flex items-center gap-1 text-forest-700">
            <dt class="sr-only">Minutes outside</dt>
            <Clock :size="16" aria-hidden="true" />
            <dd class="tabular-nums">
              {{ summary.stats.outdoorMinutes }} <span class="font-medium">min</span>
            </dd>
          </div>
        </dl>
      </section>

      <div
        class="mx-auto flex max-w-[22rem] rounded-full bg-meadow-200 p-1"
        role="tablist"
        aria-label="Adventure view"
      >
        <button
          v-for="tab in [
            { id: 'trail', label: 'Trail' },
            { id: 'patches', label: 'Patches' },
          ] as const"
          :key="tab.id"
          type="button"
          role="tab"
          :aria-selected="view === tab.id"
          class="h-10 flex-1 rounded-full font-display text-lg transition-colors"
          :class="view === tab.id ? 'bg-forest-900 text-sun-400' : 'text-forest-700'"
          @click="view = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <TrailMap
        v-if="view === 'trail'"
        :regions="summary.regions"
        :pin-label="initial"
        @select="openChallenge"
      />
      <PatchCollection v-else :badges="summary.badges" class="mx-auto max-w-[22rem]" />
    </div>

    <div
      v-else
      class="flex animate-enter flex-col items-center rounded-lg bg-meadow-50 px-6 py-12 text-center"
    >
      <SearchX :size="24" class="text-forest-700" aria-hidden="true" />
      <h2 class="mt-4 font-display text-2xl text-forest-900">
        {{ isKid ? 'No map yet' : 'Kid not found' }}
      </h2>
      <p class="mt-2 text-base text-forest-700">
        {{
          isKid
            ? 'Your account isn’t linked to a profile yet. Ask your parent for help.'
            : 'This profile may have been removed.'
        }}
      </p>
      <AppButton v-if="isParent" class="mt-6" @click="router.push({ name: 'dashboard' })">
        Back to dashboard
      </AppButton>
    </div>

    <ChallengeSheet
      :challenge="selected?.challenge ?? null"
      :region="selected?.region ?? null"
      :readonly="!isKid"
      :submitting="isSubmitting"
      :error="submitError"
      @close="selectedId = null"
      @submit="submit"
    />

    <CelebrationOverlay :celebration="celebrations.current.value" @dismiss="celebrations.dismiss" />
  </AppPage>
</template>
