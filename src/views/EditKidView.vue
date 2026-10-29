<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/services/api'
import AppPage from '@/components/layout/AppPage.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import KidForm, { type KidFormValues } from '@/components/KidForm.vue'
import KidLoginCard from '@/components/KidLoginCard.vue'

const router = useRouter()
const route = useRoute()
const kidId = route.params.kidId as string

const original = ref<KidFormValues | null>(null)
const hasLogin = ref(false)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

const title = computed(() => (original.value ? `Edit ${original.value.name}` : 'Edit kid'))

const loadKid = async () => {
  isLoading.value = true
  loadError.value = null

  try {
    const kid = await api.getKid(kidId)
    original.value = {
      name: kid.name || '',
      age: kid.age || 0,
      avatarColor: kid.avatarColor || '',
      interests: kid.interests || [],
    }
    hasLogin.value = Boolean(kid.account)
  } catch (error: unknown) {
    console.error('Failed to load kid:', error)
    loadError.value = error instanceof Error ? error.message : 'Could not load this kid.'
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async (values: KidFormValues) => {
  isSubmitting.value = true
  submitError.value = null

  try {
    // Only send fields that changed
    const updates: Partial<KidFormValues> = {}
    if (values.name !== original.value?.name) updates.name = values.name
    if (values.age !== original.value?.age) updates.age = values.age
    if (values.avatarColor !== original.value?.avatarColor) updates.avatarColor = values.avatarColor
    if (JSON.stringify(values.interests) !== JSON.stringify(original.value?.interests)) {
      updates.interests = values.interests
    }

    if (Object.keys(updates).length > 0) {
      await api.updateKid(kidId, updates)
    }

    await router.push({ name: 'dashboard' })
  } catch (error: unknown) {
    console.error('Failed to update kid:', error)
    submitError.value =
      error instanceof Error ? error.message : 'Could not save changes. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(loadKid)
</script>

<template>
  <AppPage :title="title" eyebrow="Family" :back-to="{ name: 'dashboard' }" back-label="Dashboard">
    <div
      v-if="isLoading"
      class="rounded-lg bg-white p-5 shadow-sm sm:p-8"
      aria-busy="true"
      aria-label="Loading kid"
    >
      <div class="flex items-center gap-4">
        <SkeletonBlock class="size-16 rounded-full" />
        <div class="space-y-2">
          <SkeletonBlock class="h-5 w-32" />
          <SkeletonBlock class="h-4 w-20" />
        </div>
      </div>
      <div class="mt-8 grid gap-6 sm:grid-cols-[1fr_8rem]">
        <SkeletonBlock class="h-11 rounded-md" />
        <SkeletonBlock class="h-11 rounded-md" />
      </div>
      <div class="mt-6 flex gap-3">
        <SkeletonBlock v-for="n in 6" :key="n" class="size-11 rounded-full" />
      </div>
      <div class="mt-6 flex gap-2">
        <SkeletonBlock v-for="n in 4" :key="n" class="h-9 w-24 rounded-full" />
      </div>
    </div>

    <ErrorState v-else-if="loadError" :message="loadError" @retry="loadKid" />

    <KidForm
      v-else-if="original"
      :initial="original"
      submit-label="Save changes"
      submitting-label="Saving"
      :submitting="isSubmitting"
      :submit-error="submitError"
      @submit="handleSubmit"
      @cancel="router.push({ name: 'dashboard' })"
    />

    <KidLoginCard
      v-if="!isLoading && original"
      :kid-id="kidId"
      :kid-name="original.name"
      :has-login="hasLogin"
      @saved="hasLogin = true"
    />
  </AppPage>
</template>
