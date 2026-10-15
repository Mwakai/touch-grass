<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'
import AppPage from '@/components/layout/AppPage.vue'
import KidForm, { type KidFormValues } from '@/components/KidForm.vue'

const router = useRouter()

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

const handleSubmit = async (values: KidFormValues) => {
  isSubmitting.value = true
  submitError.value = null

  try {
    await api.addKid(values)
    await router.push({ name: 'dashboard' })
  } catch (error: unknown) {
    console.error('Failed to add kid:', error)
    submitError.value =
      error instanceof Error ? error.message : 'Could not add this kid. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AppPage
    title="Add a kid"
    eyebrow="Family"
    :back-to="{ name: 'dashboard' }"
    back-label="Dashboard"
  >
    <KidForm
      submit-label="Add kid"
      submitting-label="Adding kid"
      :submitting="isSubmitting"
      :submit-error="submitError"
      @submit="handleSubmit"
      @cancel="router.push({ name: 'dashboard' })"
    />
  </AppPage>
</template>
