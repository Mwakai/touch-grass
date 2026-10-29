<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Check,
  Clock,
  Copy,
  KeyRound,
  Medal,
  Pencil,
  Plus,
  Trash2,
  Trophy,
  Users,
} from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { api, type Kid } from '@/services/api'
import type { PendingCompletion } from '@/data/game'
import AppPage from '@/components/layout/AppPage.vue'
import PendingApprovals from '@/components/PendingApprovals.vue'
import AppButton from '@/components/ui/AppButton.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import KidAvatar from '@/components/ui/KidAvatar.vue'
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'

const authStore = useAuthStore()
const router = useRouter()

const title = computed(() => (authStore.user?.name ? `Hi, ${authStore.user.name}` : 'Your family'))
const kids = ref<Kid[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const kidPendingDelete = ref<Kid | null>(null)
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)

const fetchKids = async () => {
  isLoading.value = true
  error.value = null

  try {
    const [kidList, pendingList] = await Promise.all([
      api.getKids(),
      // Approvals are extra; the kid list still shows if they fail to load
      api.getPendingCompletions().catch((err: unknown) => {
        console.error('Failed to fetch approvals:', err)
        return []
      }),
    ])
    kids.value = kidList
    pending.value = pendingList
  } catch (err: unknown) {
    console.error('Failed to fetch kids:', err)
    error.value = err instanceof Error ? err.message : 'Could not load your kids.'
  } finally {
    isLoading.value = false
  }
}

const pending = ref<PendingCompletion[]>([])

const onReviewed = async (id: string) => {
  pending.value = pending.value.filter((item) => item.id !== id)
  // Refresh points and stats on the kid cards
  try {
    kids.value = await api.getKids()
  } catch (err: unknown) {
    console.error('Failed to refresh kids:', err)
  }
}

const requestDelete = (kid: Kid) => {
  deleteError.value = null
  kidPendingDelete.value = kid
}

const confirmDelete = async () => {
  const kid = kidPendingDelete.value
  if (!kid) return

  isDeleting.value = true
  deleteError.value = null

  try {
    await api.deleteKid(kid.id)
    kids.value = kids.value.filter((k) => k.id !== kid.id)
    kidPendingDelete.value = null
  } catch (err: unknown) {
    console.error('Failed to delete kid:', err)
    deleteError.value = err instanceof Error ? err.message : 'Could not remove this kid.'
  } finally {
    isDeleting.value = false
  }
}

const copied = ref(false)

const copyFamilyCode = async () => {
  if (!authStore.user?.familyCode) return
  try {
    await navigator.clipboard.writeText(authStore.user.familyCode)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch (err: unknown) {
    console.error('Copy failed:', err)
  }
}

const isAccountDeleteOpen = ref(false)
const isDeletingAccount = ref(false)
const accountDeleteError = ref<string | null>(null)

const openAccountDelete = () => {
  accountDeleteError.value = null
  isAccountDeleteOpen.value = true
}

const confirmAccountDelete = async () => {
  isDeletingAccount.value = true
  accountDeleteError.value = null

  try {
    await authStore.deleteAccount()
    await router.push({ name: 'login' })
  } catch (err: unknown) {
    console.error('Failed to delete account:', err)
    accountDeleteError.value =
      err instanceof Error ? err.message : 'Could not delete your account. Please try again.'
  } finally {
    isDeletingAccount.value = false
  }
}

const statsFor = (kid: Kid) => [
  { label: 'Challenges', value: kid.stats?.challenges ?? 0, icon: Trophy },
  { label: 'Badges', value: kid.stats?.badges ?? 0, icon: Medal },
  { label: 'Minutes outside', value: kid.stats?.outdoorMinutes ?? 0, icon: Clock },
]

onMounted(fetchKids)
</script>

<template>
  <AppPage :title="title" eyebrow="Parent dashboard">
    <template v-if="!isLoading && !error && kids.length" #actions>
      <AppButton :icon="Plus" @click="$router.push({ name: 'add-kid' })">Add kid</AppButton>
    </template>

    <div
      v-if="isLoading"
      class="grid gap-4 md:grid-cols-2"
      aria-busy="true"
      aria-label="Loading kids"
    >
      <div v-for="n in 2" :key="n" class="rounded-lg bg-white p-5 shadow-sm">
        <div class="flex items-center gap-4">
          <SkeletonBlock class="size-12 rounded-full" />
          <div class="space-y-2">
            <SkeletonBlock class="h-5 w-28" />
            <SkeletonBlock class="h-4 w-16" />
          </div>
        </div>
        <div class="mt-5 grid grid-cols-3 gap-2">
          <SkeletonBlock v-for="s in 3" :key="s" class="h-16 rounded-md" />
        </div>
      </div>
    </div>

    <ErrorState v-else-if="error" :message="error" @retry="fetchKids" />

    <section
      v-if="!isLoading && !error && authStore.user?.familyCode"
      class="mb-6 flex animate-enter flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-5 shadow-sm"
    >
      <div>
        <p class="text-xs font-medium text-ink-500">Family code</p>
        <p class="mt-1 font-mono text-xl font-semibold tracking-widest text-ink-900">
          {{ authStore.user.familyCode }}
        </p>
        <p class="mt-1 text-sm text-ink-500">
          Kids log in with this code plus the username and PIN you set for them.
        </p>
      </div>
      <AppButton
        variant="secondary"
        size="sm"
        :icon="copied ? Check : Copy"
        @click="copyFamilyCode"
      >
        {{ copied ? 'Copied' : 'Copy' }}
      </AppButton>
    </section>

    <PendingApprovals v-if="!isLoading && !error" :items="pending" @reviewed="onReviewed" />

    <ul v-if="!isLoading && !error && kids.length" class="grid gap-4 md:grid-cols-2">
      <li
        v-for="(kid, index) in kids"
        :key="kid.id"
        class="lift stagger relative animate-enter rounded-lg bg-white shadow-sm"
        :style="{ '--i': index }"
      >
        <RouterLink
          :to="{ name: 'kid-dashboard', params: { kidId: kid.id } }"
          class="block rounded-lg p-5"
        >
          <div class="flex items-center gap-4 pr-24">
            <KidAvatar :name="kid.name" :color="kid.avatarColor" />
            <div class="min-w-0">
              <h2 class="truncate text-lg font-semibold text-ink-900">{{ kid.name }}</h2>
              <p class="text-sm text-ink-500">
                {{ kid.age }} years old · {{ (kid.points ?? 0).toLocaleString() }} XP
              </p>
              <p
                v-if="!kid.account"
                class="mt-1 inline-flex items-center gap-1 rounded-full bg-sun-100 px-2 py-0.5 text-xs font-semibold text-sun-700"
              >
                <KeyRound :size="12" aria-hidden="true" />
                No login yet
              </p>
            </div>
          </div>

          <dl class="mt-5 grid grid-cols-3 gap-2">
            <div v-for="stat in statsFor(kid)" :key="stat.label" class="rounded-md bg-ink-50 p-3">
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
        </RouterLink>

        <div class="absolute right-3 top-3 flex gap-1">
          <AppButton
            variant="ghost"
            size="sm"
            icon-only
            :icon="Pencil"
            :label="`Edit ${kid.name}`"
            @click="$router.push({ name: 'edit-kid', params: { kidId: kid.id } })"
          />
          <AppButton
            variant="ghost"
            size="sm"
            icon-only
            :icon="Trash2"
            :label="`Remove ${kid.name}`"
            @click="requestDelete(kid)"
          />
        </div>
      </li>
    </ul>

    <section
      v-else-if="!isLoading && !error"
      class="flex animate-enter flex-col items-center rounded-lg bg-white px-6 py-12 text-center shadow-sm"
    >
      <span
        class="flex size-12 items-center justify-center rounded-full bg-grass-50 text-grass-600"
      >
        <Users :size="24" aria-hidden="true" />
      </span>
      <h2 class="mt-4 text-xl font-semibold text-ink-900">No kids added yet</h2>
      <p class="mt-2 max-w-sm text-base text-ink-500">
        Add a child to give them outdoor challenges and see how much time they spend outside.
      </p>
      <AppButton class="mt-6" :icon="Plus" @click="$router.push({ name: 'add-kid' })">
        Add kid
      </AppButton>
    </section>

    <ConfirmDialog
      :open="!!kidPendingDelete"
      :title="`Remove ${kidPendingDelete?.name ?? 'kid'}?`"
      message="Their login, points, challenges, badges and notes will be deleted from Touch Grass. This can't be undone."
      confirm-label="Remove"
      :loading="isDeleting"
      :error="deleteError"
      @confirm="confirmDelete"
      @cancel="kidPendingDelete = null"
    />

    <section
      v-if="!isLoading && !error"
      class="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-ink-200 pt-6"
    >
      <div>
        <h2 class="text-base font-semibold text-ink-900">Delete your account</h2>
        <p class="mt-1 text-sm text-ink-500">
          Removes your account and everything about your kids: profiles, logins and history.
        </p>
      </div>
      <AppButton variant="ghost" size="sm" :icon="Trash2" @click="openAccountDelete">
        Delete account
      </AppButton>
    </section>

    <ConfirmDialog
      :open="isAccountDeleteOpen"
      title="Delete your account?"
      message="Your account and all your kids' profiles, logins, challenges and notes will be deleted. This can't be undone."
      confirm-label="Delete account"
      :loading="isDeletingAccount"
      :error="accountDeleteError"
      @confirm="confirmAccountDelete"
      @cancel="isAccountDeleteOpen = false"
    />
  </AppPage>
</template>
