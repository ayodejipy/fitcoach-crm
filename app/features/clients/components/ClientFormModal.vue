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
const title = computed(() => mode.value === 'add' ? 'Add new client' : 'Edit Client')
const description = computed(() =>
  mode.value === 'add' ? "They'll receive a portal invite once added" : undefined,
)

const sendInvite = ref(true)

// ── Preset options ─────────────────────────────────────────

const GOAL_OPTIONS = [
  'Fat Loss', 'Muscle Gain', 'Nutrition + Fitness',
  'Strength Training', 'Athletic Performance',
  'Marathon / Endurance', 'General Fitness',
].map(g => ({ label: g, value: g }))

const PLAN_OPTIONS = [
  { label: 'Starter · $99/mo',       value: 'Starter',      price: 99  as number | null },
  { label: 'Pro Coaching · $199/mo',  value: 'Pro Coaching', price: 199 as number | null },
  { label: 'Custom',                   value: 'Custom',        price: null as number | null },
]

// ── Zod schema ─────────────────────────────────────────────

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

type FormState = {
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
  const c = props.client
  return {
    first_name:    c?.first_name ?? '',
    last_name:     c?.last_name ?? '',
    email:         c?.email ?? '',
    phone:         c?.phone ?? '',
    goal:          c?.goal ?? '',
    goal_sub:      c?.goal_sub ?? '',
    plan_name:     c?.plan_name ?? '',
    plan_price:    c?.plan_price_cents ? c.plan_price_cents / 100 : null,
    start_date:    c?.start_date ?? format(new Date(), 'yyyy-MM-dd'),
    status:        (c?.status as FormState['status']) ?? 'active',
    program_total: c?.program_total ?? null,
  }
}

const state = reactive<FormState>(buildState())

watch(() => props.open, (open) => {
  if (open) Object.assign(state, buildState())
})

// Writable computed: maps plan_name ↔ PLAN_OPTIONS, also syncs plan_price
const selectedPlanValue = computed({
  get: () => PLAN_OPTIONS.find(p => p.value === state.plan_name)?.value ?? '',
  set: (v: string) => {
    const opt = PLAN_OPTIONS.find(p => p.value === v)
    if (opt) {
      state.plan_name = opt.value
      state.plan_price = opt.price
    }
  },
})

// ── API ────────────────────────────────────────────────────

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

    toast.add({ title: mode.value === 'add' ? 'Client added!' : 'Client updated!', color: 'success' })
    emit('saved', saved)
    emit('update:open', false)
  } catch {
    toast.add({ title: 'Failed to save client', color: 'error' })
  } finally {
    submitting.value = false
  }
}

const statusOptions = [
  { label: 'Active',     value: 'active' },
  { label: 'Trial / New', value: 'new' },
  { label: 'Paused',     value: 'paused' },
  { label: 'Ended',      value: 'ended' },
]
</script>

<template>
  <UModal
    :open="open"
    :title="title"
    :description="description"
    :ui="{ body: 'overflow-y-auto max-h-[65vh]' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <UForm id="client-form" :schema="schema" :state="state" class="flex flex-col gap-4" @submit="handleSubmit">
        <!-- Name (both modes) -->
        <div class="grid grid-cols-2 gap-3">
          <UFormField name="first_name" label="First name" required>
            <UInput v-model="state.first_name" placeholder="Sofia" class="rounded-[10px]" />
          </UFormField>
          <UFormField name="last_name" label="Last name" required>
            <UInput v-model="state.last_name" placeholder="Reyes" class="rounded-[10px]" />
          </UFormField>
        </div>

        <!-- ── ADD MODE ──────────────────────────────────────────── -->
        <template v-if="mode === 'add'">
          <UFormField name="email" label="Email address" required>
            <UInput v-model="state.email" type="email" placeholder="sofia@example.com" class="rounded-[10px]" />
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField name="phone" label="Phone">
              <UInput v-model="state.phone" type="tel" placeholder="+1 (555) 000-0000" class="rounded-[10px]" />
            </UFormField>
            <UFormField name="start_date" label="Start date" required>
              <UInput v-model="state.start_date" type="date" class="rounded-[10px]" />
            </UFormField>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <UFormField name="plan_name" label="Coaching plan">
              <USelect v-model="selectedPlanValue" :items="PLAN_OPTIONS" value-key="value" label-key="label" placeholder="Select a plan" class="rounded-[10px]" />
            </UFormField>
            <UFormField name="goal" label="Primary goal" required>
              <USelect v-model="state.goal" :items="GOAL_OPTIONS" value-key="value" label-key="label" placeholder="Select a goal" class="rounded-[10px]" />
            </UFormField>
          </div>

          <!-- Portal invite toggle -->
          <div class="flex items-center justify-between px-3.5 py-3 rounded-[10px] bg-(--bg-input) border border-(--border)">
            <div>
              <div class="text-[13px] font-semibold text-(--text-primary)">Send portal invite</div>
              <div class="text-[12px] text-(--text-muted) mt-0.5">Client receives an email to set up their account</div>
            </div>
            <USwitch v-model="sendInvite" />
          </div>
        </template>

        <!-- ── EDIT MODE ─────────────────────────────────────────── -->
        <template v-else>
          <div class="grid grid-cols-2 gap-3">
            <UFormField name="email" label="Email" required>
              <UInput v-model="state.email" type="email" placeholder="sofia@example.com" class="rounded-[10px]" />
            </UFormField>
            <UFormField name="phone" label="Phone">
              <UInput v-model="state.phone" type="tel" placeholder="+1 555 0100" class="rounded-[10px]" />
            </UFormField>
          </div>

          <UFormField name="goal" label="Primary goal" required>
            <UInput v-model="state.goal" placeholder="e.g. Fat Loss" class="rounded-[10px]" />
          </UFormField>

          <UFormField name="goal_sub" label="Goal details">
            <UInput v-model="state.goal_sub" placeholder="e.g. 12-week program" class="rounded-[10px]" />
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField name="plan_name" label="Plan name">
              <UInput v-model="state.plan_name" placeholder="Pro Coaching" class="rounded-[10px]" />
            </UFormField>
            <UFormField name="plan_price" label="Plan price ($/mo)">
              <UInput v-model.number="state.plan_price" type="number" placeholder="199" :min="0" :step="1" class="rounded-[10px]" />
            </UFormField>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <UFormField name="start_date" label="Start date" required>
              <UInput v-model="state.start_date" type="date" class="rounded-[10px]" />
            </UFormField>
            <UFormField name="program_total" label="Program length (weeks)">
              <UInput v-model.number="state.program_total" type="number" placeholder="12" :min="1" :step="1" class="rounded-[10px]" />
            </UFormField>
          </div>

          <UFormField name="status" label="Status">
            <USelect v-model="state.status" :items="statusOptions" value-key="value" label-key="label" class="rounded-[10px]" />
          </UFormField>
        </template>
      </UForm>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton variant="ghost" color="neutral" :disabled="submitting" @click="emit('update:open', false)">
          Cancel
        </UButton>
        <UButton form="client-form" type="submit" color="primary" :loading="submitting">
          <svg v-if="mode === 'add' && !submitting" width="12" height="12" viewBox="0 0 12 12" fill="none" class="shrink-0">
            <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          {{ mode === 'add' ? 'Add client' : 'Save Changes' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
