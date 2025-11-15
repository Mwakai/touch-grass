<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getKidById, mockKids, type KidChallenge } from '@/data/kids'

const route = useRoute()
const router = useRouter()

const kidId = computed(() => route.params.kidId as string | undefined)
const kid = computed(() => (kidId.value ? getKidById(kidId.value) : mockKids[0]))

watchEffect(() => {
  if (!kid.value) {
    router.replace({ name: 'dashboard' })
  }
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
</script>

<template>
  <div v-if="kid" class="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white pb-24">
    <header class="px-6 pt-6">
      <button
        class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        @click="router.push({ name: 'dashboard' })"
      >
        ← Back
      </button>
    </header>

    <section class="px-6 pb-8 pt-6">
      <div class="relative overflow-hidden rounded-[32px] bg-white/80 p-6 shadow-xl ring-1 ring-white/60 backdrop-blur">
        <div class="flex flex-col gap-6 md:flex-row md:items-center">
          <div
            class="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br text-4xl font-bold text-white shadow-lg"
            :class="kid.avatarGradient"
          >
            {{ kid.name.charAt(0) }}
          </div>
          <div class="flex-1">
            <p class="text-sm uppercase tracking-wide text-slate-400">Explorer</p>
            <h1 class="text-3xl font-bold text-slate-900">{{ kid.name }}</h1>
            <p class="text-sm text-slate-500">{{ humanDate }} · {{ humanTime }}</p>
          </div>
          <div class="flex flex-col items-start gap-2 rounded-2xl bg-emerald-500/10 px-6 py-4 text-emerald-600">
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
                <h3 class="text-lg font-semibold" :class="challenge.status === 'locked' ? 'text-slate-400' : 'text-slate-900'">
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
              <p class="mt-1 text-sm" :class="challenge.status === 'locked' ? 'text-slate-400' : 'text-slate-500'">
                {{ challenge.description }}
              </p>
              <div class="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-600">
                  ⭐ {{ challenge.points }} pts
                </span>
                <span v-if="challenge.distance" class="inline-flex items-center gap-1 text-slate-500">
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
        <div class="no-scrollbar mt-4 flex gap-4 overflow-x-auto pb-2">
          <div
            v-for="badge in kid.badges"
            :key="badge.id"
            class="min-w-[120px] rounded-2xl bg-white px-4 py-5 text-center shadow-md shadow-slate-100 ring-1 ring-slate-100"
          >
            <div class="text-3xl">{{ badge.emoji }}</div>
            <p class="mt-2 text-sm font-semibold text-slate-700">{{ badge.name }}</p>
          </div>
        </div>
      </section>
    </main>

    <button
      class="fixed bottom-28 right-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-3xl text-white shadow-2xl shadow-emerald-500/30 transition hover:scale-105"
    >
      📷
    </button>
  </div>
</template>
