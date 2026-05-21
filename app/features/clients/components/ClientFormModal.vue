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
const title = computed(() => mode.value === 'add' ? 'Add New Client' : 'Edit Client')

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

// ── API ────────────────────────────────────────────────────

const clientsApi = useClientsApi()
const toast = useToast()
const submitting = ref(false)

async function handleSubmit() {
  submitting.value = true
  try {
    const body = {
      first_name:        state.first_name,
      last_name:         state.last_name,
      email:             state.email,
      phone:             state.phone || undefined,
      goal:              state.goal,
      goal_sub:          state.goal_sub || undefined,
      plan_name:         state.plan_name || undefined,
      plan_price_cents:  state.plan_price ? Math.round(state.plan_price * 100) : undefined,
      start_date:        state.start_date,
      status:            state.status,
      program_total:     state.program_total ?? undefined,
    }

    let saved: ModelsClient
    if (mode.value === 'edit' && props.client?.id) {
      saved = await clientsApi.update(props.client.id, body)
    } else {
      saved = await clientsApi.create(body as HandlersCreateClientRequest)
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
  { label: 'Active', value: 'active' },
  { label: 'Trial / New', value: 'new' },
  { label: 'Paused', value: 'paused' },
  { label: 'Ended', value: 'ended' },
]
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4"
        @keydown.esc="emit('update:open', false)"
      >
        <div class="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px]" @click="emit('update:open', false)" />

        <div class="relative bg-(--bg-surface) border border-(--border) rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-(--border) flex items-center justify-between shrink-0">
            <h2 class="text-[16px] font-extrabold text-(--text-primary) tracking-[-0.2px]">{{ title }}</h2>
            <button type="button" class="w-8 h-8 rounded-lg flex items-center justify-center text-(--text-muted) hover:bg-(--bg-elevated) hover:text-(--text-primary) transition-colors" @click="emit('update:open', false)">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="overflow-y-auto flex-1 px-6 py-5 custom-scrollbar">
            <UForm :schema="schema" :state="state" class="flex flex-col gap-4" @submit="handleSubmit">
              <!-- Name -->
              <div class="grid grid-cols-2 gap-3">
                <UFormField name="first_name" label="First name" required>
                  <UInput v-model="state.first_name" placeholder="Sofia" :ui="{ base: 'rounded-[10px]' }" />
                </UFormField>
                <UFormField name="last_name" label="Last name" required>
                  <UInput v-model="state.last_name" placeholder="Reyes" :ui="{ base: 'rounded-[10px]' }" />
                </UFormField>
              </div>

              <!-- Email + Phone -->
              <div class="grid grid-cols-2 gap-3">
                <UFormField name="email" label="Email" required>
                  <UInput v-model="state.email" type="email" placeholder="sofia@example.com" :ui="{ base: 'rounded-[10px]' }" />
                </UFormField>
                <UFormField name="phone" label="Phone">
                  <UInput v-model="state.phone" type="tel" placeholder="+1 555 0100" :ui="{ base: 'rounded-[10px]' }" />
                </UFormField>
              </div>

              <!-- Goal -->
              <UFormField name="goal" label="Primary goal" required>
                <UInput v-model="state.goal" placeholder="e.g. Fat Loss" :ui="{ base: 'rounded-[10px]' }" />
              </UFormField>

              <UFormField name="goal_sub" label="Goal details">
                <UInput v-model="state.goal_sub" placeholder="e.g. 12-week program" :ui="{ base: 'rounded-[10px]' }" />
              </UFormField>

              <!-- Plan -->
              <div class="grid grid-cols-2 gap-3">
                <UFormField name="plan_name" label="Plan name">
                  <UInput v-model="state.plan_name" placeholder="Pro Coaching" :ui="{ base: 'rounded-[10px]' }" />
                </UFormField>
                <UFormField name="plan_price" label="Plan price ($/mo)">
                  <UInput
                    v-model.number="state.plan_price"
                    type="number"
                    placeholder="199"
                    :min="0"
                    :step="1"
                    :ui="{ base: 'rounded-[10px]' }"
                  />
                </UFormField>
              </div>

              <!-- Start date + Program length -->
              <div class="grid grid-cols-2 gap-3">
                <UFormField name="start_date" label="Start date" required>
                  <UInput v-model="state.start_date" type="date" :ui="{ base: 'rounded-[10px]' }" />
                </UFormField>
                <UFormField name="program_total" label="Program length (weeks)">
                  <UInput
                    v-model.number="state.program_total"
                    type="number"
                    placeholder="12"
                    :min="1"
                    :step="1"
                    :ui="{ base: 'rounded-[10px]' }"
                  />
                </UFormField>
              </div>

              <!-- Status -->
              <UFormField name="status" label="Status">
                <USelect v-model="state.status" :options="statusOptions" value-key="value" label-key="label" :ui="{ base: 'rounded-[10px]' }" />
              </UFormField>

              <!-- Footer inside form so submit works -->
              <div class="flex justify-end gap-2 pt-2 border-t border-(--border) mt-1">
                <UButton variant="ghost" color="neutral" :disabled="submitting" @click="emit('update:open', false)">
                  Cancel
                </UButton>
                <UButton type="submit" color="primary" :loading="submitting">
                  {{ mode === 'add' ? 'Add Client' : 'Save Changes' }}
                </UButton>
              </div>
            </UForm>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active { transition: opacity .18s ease, transform .18s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; transform: scale(.97); }

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #D1E0D5; border-radius: 3px; }
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); }
</style>
