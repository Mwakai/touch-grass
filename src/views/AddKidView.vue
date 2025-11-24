<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'

type Interest = {
  id: string
  label: string
  icon: string
}

type ColorOption = {
  id: string
  label: string
  gradient: string
}

const router = useRouter()

const colorOptions: ColorOption[] = [
  { id: 'sunrise', label: 'Sunrise', gradient: 'from-pink-500 via-rose-400 to-orange-400' },
  { id: 'forest', label: 'Forest', gradient: 'from-emerald-500 via-lime-400 to-teal-400' },
  { id: 'ocean', label: 'Ocean', gradient: 'from-cyan-500 via-sky-400 to-blue-500' },
  { id: 'sunset', label: 'Sunset', gradient: 'from-amber-500 via-orange-400 to-rose-400' },
  { id: 'cosmic', label: 'Cosmic', gradient: 'from-indigo-500 via-purple-500 to-pink-500' },
  { id: 'electric', label: 'Electric', gradient: 'from-fuchsia-500 via-purple-500 to-sky-500' },
]

// TODO: we need to find a different way of doing the interest section
// interest should be from db or parent can add interests
const interestOptions: Interest[] = [
  { id: 'football', label: 'Football', icon: '⚽' },
  { id: 'cycling', label: 'Cycling', icon: '🚴' },
  { id: 'nature', label: 'Nature', icon: '🌿' },
  { id: 'art', label: 'Art', icon: '🎨' },
  { id: 'exploring', label: 'Exploring', icon: '🗺️' },
]

const form = ref({
  name: '',
  age: '',
  color: colorOptions[0]?.gradient ?? '',
  interests: [] as string[],
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

const avatarLetter = computed(() =>
  form.value.name ? form.value.name.charAt(0).toUpperCase() : 'K',
)

const toggleInterest = (interestId: string) => {
  if (form.value.interests.includes(interestId)) {
    form.value.interests = form.value.interests.filter((id) => id !== interestId)
  } else {
    form.value.interests = [...form.value.interests, interestId]
  }
}

const validateForm = () => {
  const nextErrors: Record<string, string> = {}

  if (!form.value.name.trim()) nextErrors.name = 'Name is required'
  if (!form.value.age) nextErrors.age = 'Age is required'
  if (!form.value.color) nextErrors.color = 'Choose an avatar color'
  if (!form.value.interests.length) nextErrors.interests = 'Select at least one interest'

  errors.value = nextErrors
  return !Object.keys(nextErrors).length
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  errors.value = {}

  try {
    await api.addKid({
      name: form.value.name.trim(),
      age: parseInt(form.value.age),
      avatarColor: form.value.color,
      interests: form.value.interests,
    })

    // Success redirect to dashboard
    router.push({ name: 'dashboard' })
  } catch (error: unknown) {
    console.error('Failed to add kid:', error)
    errors.value.submit = error instanceof Error ? error.message : 'Failed to add kid. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.back()
}

const selectColor = (gradient: string) => {
  form.value.color = gradient
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-12">
    <header class="flex items-center gap-4 px-6 py-6">
      <button
        class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        @click="router.back()"
      >
        ←
      </button>
      <div>
        <p class="text-sm text-slate-500">Family</p>
        <h1 class="text-2xl font-semibold text-slate-900">Add New Kid</h1>
      </div>
    </header>

    <main class="mx-auto max-w-3xl px-6">
      <section class="rounded-3xl bg-white p-8 shadow-lg shadow-slate-200">
        <div class="flex items-center gap-6">
          <div
            class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br text-3xl font-bold text-white shadow-lg"
            :class="form.color"
          >
            {{ avatarLetter }}
          </div>
          <div>
            <p class="text-sm text-slate-500">Avatar Preview</p>
            <p class="text-lg font-semibold text-slate-900">
              {{ form.name || 'Your Kid' }}
            </p>
            <p class="text-sm text-slate-500">Tap colors below to personalize</p>
          </div>
        </div>

        <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
          <div>
            <label class="text-sm font-medium text-slate-700">Name</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Enter kid's name"
              class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-rose-500">{{ errors.name }}</p>
          </div>

          <div>
            <label class="text-sm font-medium text-slate-700">Age</label>
            <input
              v-model="form.age"
              type="number"
              min="1"
              placeholder="How old?"
              class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            <p v-if="errors.age" class="mt-1 text-sm text-rose-500">{{ errors.age }}</p>
          </div>

          <div>
            <label class="text-sm font-medium text-slate-700">Avatar Color</label>
            <div class="mt-3 grid grid-cols-3 gap-4 sm:grid-cols-6">
              <button
                v-for="color in colorOptions"
                :key="color.id"
                type="button"
                class="relative h-14 rounded-full bg-gradient-to-br transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                :class="color.gradient"
                @click="selectColor(color.gradient)"
              >
                <span
                  v-if="form.color === color.gradient"
                  class="absolute inset-1 rounded-full border-2 border-white"
                ></span>
              </button>
            </div>
            <p v-if="errors.color" class="mt-1 text-sm text-rose-500">{{ errors.color }}</p>
          </div>

          <div>
            <label class="text-sm font-medium text-slate-700">Interests</label>
            <div class="mt-3 flex flex-wrap gap-3">
              <button
                v-for="interest in interestOptions"
                :key="interest.id"
                type="button"
                class="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition"
                :class="
                  form.interests.includes(interest.id)
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600'
                "
                @click="toggleInterest(interest.id)"
              >
                <span class="text-lg">{{ interest.icon }}</span>
                {{ interest.label }}
              </button>
            </div>
            <p v-if="errors.interests" class="mt-1 text-sm text-rose-500">{{ errors.interests }}</p>
          </div>

          <div class="pt-4">
            <p v-if="errors.submit" class="mb-3 text-center text-sm text-rose-500">
              {{ errors.submit }}
            </p>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full rounded-2xl bg-emerald-500 py-3 text-lg font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'Adding...' : 'Add Kid' }}
            </button>
            <button
              type="button"
              class="mx-auto mt-3 block text-sm font-medium text-slate-400 transition hover:text-slate-600"
              @click="handleCancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </main>
  </div>
</template>
