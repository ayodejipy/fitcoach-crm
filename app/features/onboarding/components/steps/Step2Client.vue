<script setup lang="ts">
import StepHeader from '../StepHeader.vue'

const props = defineProps<{
  form: {
    clientFirstName: string
    clientLastName: string
    clientEmail: string
    clientPhone: string
    clientStartDate: string
    clientGoal: string | null
  }
}>()

const GOAL_OPTIONS = [
  '🏋️ Build muscle',
  '🔥 Lose weight',
  '🧘 Improve fitness',
  '🥗 Nutrition focus',
  '🏃 Athletic performance',
  '💪 Strength & conditioning',
] as const

const initials = computed(() => {
  const first = props.form.clientFirstName.trim()[0] ?? ''
  const last = props.form.clientLastName.trim()[0] ?? ''
  return (first + last).toUpperCase() || '?'
})

const previewName = computed(() => {
  const name = [props.form.clientFirstName, props.form.clientLastName]
    .map(s => s.trim()).filter(Boolean).join(' ')
  return name || 'Client name'
})

const previewEmail = computed(() => props.form.clientEmail.trim() || 'email@example.com')
</script>

<template>
  <div class="flex-1 px-10 py-10 overflow-y-auto max-md:px-5">
    <div class="max-w-[520px] mx-auto">
      <StepHeader
        title="Add your first client"
        sub="You can add more later. Let's start with one to see how everything works."
      />

      <div class="flex items-center gap-3.5 rounded-[12px] border-[1.5px] border-(--green-soft) bg-(--green-pale) px-4 py-3.5 mb-5">
        <div class="h-11 w-11 rounded-full flex items-center justify-center text-white font-semibold text-[15px] shrink-0 bg-gradient-to-br from-(--green-brand) to-(--green-hover)">
          {{ initials }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-[13.5px] font-semibold text-(--text-primary)">{{ previewName }}</div>
          <div class="text-[11.5px] text-(--text-secondary)">{{ previewEmail }}</div>
        </div>
        <UBadge label="New client" color="success" variant="soft" size="sm" />
      </div>

      <div class="space-y-5">
        <div class="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <UFormField label="First name" name="clientFirstName">
            <UInput v-model="form.clientFirstName" placeholder="Sofia" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Last name" name="clientLastName" hint="optional">
            <UInput v-model="form.clientLastName" placeholder="Rodriguez" size="lg" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="Email address" name="clientEmail">
          <UInput
            v-model="form.clientEmail"
            type="email"
            placeholder="sofia@email.com"
            size="lg"
            icon="i-lucide-mail"
            class="w-full"
          />
          <template #help>
            <p class="text-[10.5px] text-(--text-muted) mt-1">
              We'll invite this client to your portal so they can submit weekly check-ins.
            </p>
          </template>
        </UFormField>

        <div class="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <UFormField label="Phone" name="clientPhone" hint="optional">
            <UInput
              v-model="form.clientPhone"
              type="tel"
              placeholder="+234…"
              size="lg"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Start date" name="clientStartDate">
            <UInput
              v-model="form.clientStartDate"
              type="date"
              size="lg"
              class="w-full tabular-nums"
            />
          </UFormField>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-[12px] font-medium text-(--text-secondary)">Primary goal</label>
            <span class="text-[11px] text-(--text-muted)">pick one</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="goal in GOAL_OPTIONS"
              :key="goal"
              type="button"
              class="rounded-full border-[1.5px] px-3 py-1.5 text-[12px] transition-colors"
              :class="form.clientGoal === goal
                ? 'border-(--green-brand) bg-(--green-pale) text-(--green-brand) font-semibold'
                : 'border-(--border) text-(--text-secondary) font-medium hover:bg-(--bg-subtle)'"
              @click="form.clientGoal = goal"
            >
              {{ goal }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
