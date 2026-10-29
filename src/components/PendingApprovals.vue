<script setup lang="ts">
import { ref } from 'vue'
import { Check, Star, Undo2 } from '@lucide/vue'
import { api } from '@/services/api'
import type { PendingCompletion } from '@/data/game'
import AppButton from '@/components/ui/AppButton.vue'
import KidAvatar from '@/components/ui/KidAvatar.vue'

/** Challenges kids have marked done, waiting for the parent to approve. */
const props = defineProps<{ items: PendingCompletion[] }>()
const emit = defineEmits<{ reviewed: [id: string] }>()

const busy = ref<{ id: string; decision: 'approve' | 'reject' } | null>(null)
const errors = ref<Record<string, string>>({})

const review = async (item: PendingCompletion, decision: 'approve' | 'reject') => {
  busy.value = { id: item.id, decision }
  delete errors.value[item.id]
  try {
    await api.reviewCompletion(item.id, decision)
    emit('reviewed', item.id)
  } catch (err: unknown) {
    errors.value[item.id] = err instanceof Error ? err.message : 'Could not save. Try again.'
  } finally {
    busy.value = null
  }
}

const when = (iso: string) => {
  const minutes = Math.round((Date.now() - Date.parse(iso)) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(iso))
}
</script>

<template>
  <section v-if="props.items.length" aria-labelledby="approvals-heading" class="mb-8">
    <h2 id="approvals-heading" class="text-lg font-semibold text-ink-900">Waiting for your OK</h2>
    <p class="text-sm text-ink-500">Approve a challenge to give your kid its XP.</p>

    <ul class="mt-3 space-y-3">
      <li v-for="item in props.items" :key="item.id" class="rounded-lg bg-white p-4 shadow-sm">
        <div class="flex items-start gap-3">
          <KidAvatar :name="item.kid.name" :color="item.kid.avatarColor" />
          <div class="min-w-0 flex-1">
            <p class="text-base text-ink-900">
              <span class="font-semibold">{{ item.kid.name }}</span> finished
              <span class="font-semibold">{{ item.challenge.title }}</span>
            </p>
            <p class="mt-0.5 flex items-center gap-3 text-sm text-ink-500">
              <span class="inline-flex items-center gap-1 font-medium text-sun-700">
                <Star :size="14" aria-hidden="true" />
                {{ item.challenge.xp }} XP
              </span>
              {{ when(item.submittedAt) }}
            </p>
            <p v-if="item.note" class="mt-2 rounded-md bg-ink-50 px-3 py-2 text-sm text-ink-700">
              “{{ item.note }}”
            </p>
          </div>
        </div>

        <p v-if="errors[item.id]" role="alert" class="mt-3 text-sm text-danger-600">
          {{ errors[item.id] }}
        </p>

        <div class="mt-3 flex justify-end gap-2">
          <AppButton
            variant="secondary"
            size="sm"
            :icon="Undo2"
            :loading="busy?.id === item.id && busy.decision === 'reject'"
            :disabled="!!busy"
            @click="review(item, 'reject')"
          >
            Not yet
          </AppButton>
          <AppButton
            size="sm"
            :icon="Check"
            :loading="busy?.id === item.id && busy.decision === 'approve'"
            :disabled="!!busy"
            @click="review(item, 'approve')"
          >
            Approve
          </AppButton>
        </div>
      </li>
    </ul>
  </section>
</template>
