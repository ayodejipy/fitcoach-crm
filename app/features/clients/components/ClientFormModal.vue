<script setup lang="ts">
import { z } from 'zod'
import { format } from 'date-fns'
import { useClientsApi } from '../composables/useClientsApi'
import type { ModelsClient, HandlersCreateClientRequest } from '~/services'

const props = withDefaults(defineProps<{
  open: boolean
  client?: ModelsClient
}>(), {
  open: false,
})

const emit = defineEmits<{
  'update:open': [val: boolean]
  saved: [client: ModelsClient]
}>()

const mode = computed(() => props.client ? 'edit' : 'add')
const title = computed(() => mode.value === 'add' ? 'Add new client' : 'Edit client')
const description = computed(() =>
  mode.value === 'add' ? "They'll receive a portal invite once added." : 'Update this client\'s details.',
)

const sendInvite = ref(true)

const GOAL_OPTIONS = [
  'Fat Loss', 'Muscle Gain', 'Nutrition + Fitness',
  'Strength Training', 'Athletic Performance',
  'Marathon / Endurance', 'General Fitness',
].map(label => ({ label, value: label }))

const PLAN_OPTIONS = [
  { label: 'Starter · $99/mo',       value: 'Starter',      price: 99  as number | null },
  { label: 'Pro Coaching · $199/mo', value: 'Pro Coaching', price: 199 as number | null },
  { label: 'Custom',                  value: 'Custom',       price: null as number | null },
]

const STATUS_OPTIONS = [
  { label: 'Active',      value: 'active' },
  { label: 'Trial / New', value: 'new' },
  { label: 'Paused',      value: 'paused' },
  { label: 'Ended',       value: 'ended' },
]

const schema = z.object({
  first_name:    z.string().min(1, 'Required'),
  last_name:     z.string().min(1, 'Required'),
  email:         z.email('Invalid email address'),
  phone:         z.string().optional(),
  goal:          z.string().min(1, 'Required'),
  goal_sub:      z.string().optional(),
  plan_name:     z.string().optional(),
  plan_price:    z.number().min(0).optional().nullable(),
  start_date:    z.string().min(1, 'Required'),
  status:        z.enum(['active', 'paused', 'new', 'ended']),
  program_total: z.number().int().min(1).optional().nullable(),
})

interface FormState {
  first_name: string
  last_name: string
  email: string
  phone: string
  goal: string
  goal_sub: string
  plan_name: string
  plan_price: number | null
  start_date: string
  status: 'active' | 'paused' | 'new' | 'ended'
  program_total: number | null
}

function buildState(): FormState {
  const client = props.client
  return {
    first_name:    client?.first_name ?? '',
    last_name:     client?.last_name ?? '',
    email:         client?.email ?? '',
    phone:         client?.phone ?? '',
    goal:          client?.goal ?? '',
    goal_sub:      client?.goal_sub ?? '',
    plan_name:     client?.plan_name ?? '',
    plan_price:    client?.plan_price_cents ? client.plan_price_cents / 100 : null,
    start_date:    client?.start_date ?? format(new Date(), 'yyyy-MM-dd'),
    status:        (client?.status as FormState['status']) ?? 'active',
    program_total: client?.program_total ?? null,
  }
}

const state = reactive<FormState>(buildState())

watch(() => props.open, (open) => {
  if (open) Object.assign(state, buildState())
})

const selectedPlanValue = computed({
  get: () => PLAN_OPTIONS.find(plan => plan.value === state.plan_name)?.value ?? '',
  set: (value: string) => {
    const opt = PLAN_OPTIONS.find(plan => plan.value === value)
    if (opt) {
      state.plan_name = opt.value
      state.plan_price = opt.price
    }
  },
})

const clientsApi = useClientsApi()
const toast = useToast()
const submitting = ref(false)

async function handleSubmit() {
  submitting.value = true
  try {
    const body = {
      first_name:       state.first_name,
      last_name:        state.last_name,
      email:            state.email,
      phone:            state.phone || undefined,
      goal:             state.goal,
      goal_sub:         state.goal_sub || undefined,
      plan_name:        state.plan_name || undefined,
      plan_price_cents: state.plan_price ? Math.round(state.plan_price * 100) : undefined,
      start_date:       state.start_date,
      status:           state.status,
      program_total:    state.program_total ?? undefined,
    }

    let saved: ModelsClient
    if (mode.value === 'edit' && props.client?.id) {
      saved = await clientsApi.update(props.client.id, body)
    } else {
      saved = await clientsApi.create(body as HandlersCreateClientRequest)
      if (sendInvite.value && saved.id) {
        clientsApi.invite(saved.id).catch(() => {})
      }
    }

    toast.add({ title: mode.value === 'add' ? 'Client added' : 'Client updated', color: 'success' })
    emit('saved', saved)
    emit('update:open', false)
  } catch {
    toast.add({ title: 'Failed to save client', color: 'error' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <UModal
    :open="open"
    :title="title"
    :description="description"
    :ui="{ body: 'p-5', footer: 'p-4' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <UForm id="client-form" :schema="schema" :state="state" class="flex flex-col gap-4" @submit="handleSubmit">
        <div class="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <UFormField name="first_name" label="First name" required>
            <UInput v-model="state.first_name" placeholder="Sofia" size="md" class="w-full" />
          </UFormField>
          <UFormField name="last_name" label="Last name" required>
            <UInput v-model="state.last_name" placeholder="Reyes" size="md" class="w-full" />
          </UFormField>
        </div>

        <template v-if="mode === 'add'">
          <UFormField name="email" label="Email address" required>
            <UInput v-model="state.email" type="email" placeholder="sofia@example.com" size="md" icon="i-hugeicons-mail-01" class="w-full" />
          </UFormField>

          <div class="grid grid-cols-2 gap-3 max-md:grid-cols-1">
            <UFormField name="phone" label="Phone" hint="optional">
              <UInput v-model="state.phone" type="tel" placeholder="+1 (555) 000-0000" size="md" class="w-full" />
            </UFormField>
            <UFormField name="start_date" label="Start date" required>
              <UInput v-model="state.start_date" type="date" size="md" class="w-full tabular-nums" />
            </UFormField>
          </div>

          <div class="grid grid-cols-2 gap-3 max-md:grid-cols-1">
            <UFormField name="plan_name" label="Coaching plan" hint="optional">
              <USelect v-model="selectedPlanValue" :items="PLAN_OPTIONS" value-key="value" label-key="label" placeholder="Select a plan" size="md" class="w-full" />
            </UFormField>
            <UFormField name="goal" label="Primary goal" required>
              <USelect v-model="state.goal" :items="GOAL_OPTIONS" value-key="value" label-key="label" placeholder="Select a goal" size="md" class="w-full" />
            </UFormField>
          </div>

          <div class="flex items-start justify-between gap-3 rounded-md border border-(--border) p-3.5 bg-(--bg-subtle)/40">
            <div class="flex-1 min-w-0">
              <label for="send-invite-toggle" class="text-[12.5px] font-semibold text-(--text-primary) cursor-pointer">
                Send portal invite
              </label>
              <p class="text-[11px] text-(--text-secondary) mt-0.5">
                Client receives an email to set up their account.
              </p>
            </div>
            <USwitch id="send-invite-toggle" v-model="sendInvite" aria-label="Send portal invite after creating" />
          </div>
        </template>

        <template v-else>
          <div class="grid grid-cols-2 gap-3 max-md:grid-cols-1">
            <UFormField name="email" label="Email" required>
              <UInput v-model="state.email" type="email" placeholder="sofia@example.com" size="md" class="w-full" />
            </UFormField>
            <UFormField name="phone" label="Phone" hint="optional">
              <UInput v-model="state.phone" type="tel" placeholder="+1 555 0100" size="md" class="w-full" />
            </UFormField>
          </div>

          <UFormField name="goal" label="Primary goal" required>
            <UInput v-model="state.goal" placeholder="e.g. Fat Loss" size="md" class="w-full" />
          </UFormField>

          <UFormField name="goal_sub" label="Goal details" hint="optional">
            <UInput v-model="state.goal_sub" placeholder="e.g. 12-week program" size="md" class="w-full" />
          </UFormField>

          <div class="grid grid-cols-2 gap-3 max-md:grid-cols-1">
            <UFormField name="plan_name" label="Plan name">
              <UInput v-model="state.plan_name" placeholder="Pro Coaching" size="md" class="w-full" />
            </UFormField>
            <UFormField name="plan_price" label="Plan price ($/mo)">
              <UInput v-model.number="state.plan_price" type="number" placeholder="199" :min="0" :step="1" size="md" class="w-full" />
            </UFormField>
          </div>

          <div class="grid grid-cols-2 gap-3 max-md:grid-cols-1">
            <UFormField name="start_date" label="Start date" required>
              <UInput v-model="state.start_date" type="date" size="md" class="w-full tabular-nums" />
            </UFormField>
            <UFormField name="program_total" label="Program length (weeks)">
              <UInput v-model.number="state.program_total" type="number" placeholder="12" :min="1" :step="1" size="md" class="w-full" />
            </UFormField>
          </div>

          <UFormField name="status" label="Status">
            <USelect v-model="state.status" :items="STATUS_OPTIONS" value-key="value" label-key="label" size="md" class="w-full" />
          </UFormField>
        </template>
      </UForm>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton variant="ghost" color="neutral" :disabled="submitting" @click="emit('update:open', false)">
          Cancel
        </UButton>
        <UButton
          form="client-form"
          type="submit"
          color="primary"
          :loading="submitting"
          :icon="mode === 'add' && !submitting ? 'i-hugeicons-add-circle' : undefined"
        >
          {{ mode === 'add' ? 'Add client' : 'Save changes' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
