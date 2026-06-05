<script setup lang="ts">
import { format, parseISO, addDays, differenceInDays } from 'date-fns'
import Avatar from '~/components/Avatar.vue'
import { formatMoney, moneyParts } from '~/features/payments/utils/format'

export interface InvoiceClientOption {
  id: string
  name: string
  initials: string
  variant: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
  email?: string
  plan?: string
  lastInvoiceCents?: number
}

export type InvoiceSendVia = 'email' | 'whatsapp' | 'url'

export interface InvoicePayload {
  client: string
  description: string
  amount: number | null
  dueDate: string
  methods: string[]
  sendVia: InvoiceSendVia
  saveAsDraft: boolean
}

export interface PaymentMethodOption {
  id: string
  name: string
  description: string
  connected: boolean
}

const props = withDefaults(defineProps<{
  modelValue: boolean
  clients: InvoiceClientOption[]
  defaultClientId?: string
  defaultDueDate?: string
  paymentMethods?: PaymentMethodOption[]
}>(), {
  paymentMethods: (): PaymentMethodOption[] => [
    { id: 'paystack', name: 'Paystack',      description: 'Card, transfer, USSD · 1.5% + ₦100 fee',  connected: true  },
    { id: 'bank',     name: 'Bank transfer', description: 'GTBank · zero fees, manual confirmation', connected: true  },
    { id: 'stripe',   name: 'Stripe',        description: 'For international clients · 2.9% + 30¢',  connected: false },
  ],
})

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  submit: [payload: InvoicePayload]
  'create-client': []
}>()

const QUICK_AMOUNTS = [25_000, 50_000, 100_000] as const
const NET_PRESETS = [
  { label: '+7d',  days: 7  },
  { label: '+14d', days: 14 },
  { label: '+30d', days: 30 },
] as const

const SEND_VIA: Array<{ id: InvoiceSendVia, label: string, icon: string }> = [
  { id: 'email',    label: 'Email',    icon: 'i-hugeicons-mail-01' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'i-hugeicons-whatsapp' },
  { id: 'url',      label: 'Just URL', icon: 'i-hugeicons-link-04' },
]

const today = format(new Date(), 'yyyy-MM-dd')

type FieldName = 'client' | 'description' | 'amount' | 'dueDate'

function defaultMethodIds(): string[] {
  return props.paymentMethods.filter(method => method.connected).map(method => method.id)
}

const makeForm = (): InvoicePayload => ({
  client: props.defaultClientId ?? '',
  description: '',
  amount: null,
  dueDate: props.defaultDueDate ?? format(addDays(new Date(), 14), 'yyyy-MM-dd'),
  methods: defaultMethodIds(),
  sendVia: 'email',
  saveAsDraft: false,
})

const form = reactive<InvoicePayload>(makeForm())
const touched = reactive<Record<FieldName, boolean>>({
  client: false, description: false, amount: false, dueDate: false,
})
const submitted = ref(false)
const clientPickerOpen = ref(false)

watch(() => props.modelValue, (open) => {
  if (open) {
    Object.assign(form, makeForm())
    Object.keys(touched).forEach(key => { touched[key as FieldName] = false })
    submitted.value = false
  }
})

watch(() => props.defaultClientId, (id) => {
  if (id) form.client = id
})

const selectedClient = computed(() => props.clients.find(c => c.id === form.client))

const errors = computed<Record<FieldName, string>>(() => ({
  client:      !form.client ? 'Pick a client' : '',
  amount:      !form.amount || form.amount <= 0 ? 'Enter an amount' : '',
  description: !form.description.trim() ? 'Add a short description' : '',
  dueDate:     !form.dueDate ? 'Pick a due date' : '',
}))

const isValid = computed(() => Object.values(errors.value).every(error => !error))

function errorFor(field: FieldName): string | undefined {
  if (!submitted.value && !touched[field]) return undefined
  return errors.value[field] || undefined
}

const amountSymbol = computed(() => moneyParts(0).symbol)

const dueLabel = computed(() => {
  if (!form.dueDate) return 'Pick a date'
  return format(parseISO(`${form.dueDate}T00:00:00`), 'MMM d, yyyy')
})

const dueDelta = computed(() => {
  if (!form.dueDate) return ''
  const days = differenceInDays(parseISO(`${form.dueDate}T00:00:00`), parseISO(`${today}T00:00:00`))
  if (days <= 0) return 'today'
  if (days === 1) return 'in 1 day'
  return `in ${days} days`
})

const activeNetDays = computed(() => {
  if (!form.dueDate) return null
  return differenceInDays(parseISO(`${form.dueDate}T00:00:00`), parseISO(`${today}T00:00:00`))
})

const sendHint = computed(() => {
  const slug = selectedClient.value?.name.toLowerCase().replace(/\s+/g, '-') ?? 'client'
  return `pay.fitcoachcrm.com/i/${slug}`
})

const submitCta = computed(() => {
  if (form.sendVia === 'whatsapp') return { label: 'Send via WhatsApp', icon: 'i-hugeicons-whatsapp' }
  if (form.sendVia === 'url') return { label: 'Copy invoice link', icon: 'i-hugeicons-link-04' }
  return { label: 'Send invoice', icon: 'i-hugeicons-sent' }
})

function setNet(days: number) {
  form.dueDate = format(addDays(parseISO(`${today}T00:00:00`), days), 'yyyy-MM-dd')
  touched.dueDate = true
}

function setQuickAmount(cents: number) {
  form.amount = cents / 100
  touched.amount = true
}

function toggleMethod(id: string) {
  const index = form.methods.indexOf(id)
  if (index >= 0) form.methods.splice(index, 1)
  else form.methods.push(id)
}

function pickClient(id: string) {
  form.client = id
  touched.client = true
  clientPickerOpen.value = false
}

function submit(asDraft: boolean) {
  submitted.value = true
  if (!isValid.value) return
  emit('submit', { ...form, methods: [...form.methods], saveAsDraft: asDraft })
}

function onCreateClient() {
  emit('create-client')
  clientPickerOpen.value = false
}

function onPreview() {
  if (!selectedClient.value) return
  emit('submit', { ...form, methods: [...form.methods], saveAsDraft: true })
}
</script>

<template>
  <USlideover
    :open="modelValue"
    side="right"
    :ui="{ content: 'max-w-[480px]' }"
    @update:open="$emit('update:modelValue', $event)"
  >
    <template #content>
      <form class="flex flex-col h-full" @submit.prevent="submit(false)">
        <header class="flex items-center justify-between px-5 h-[52px] border-b border-(--border) shrink-0">
          <div class="flex items-baseline gap-2">
            <h2 class="text-[14px] font-semibold text-(--text-primary)">Create invoice</h2>
            <span class="text-[11.5px] text-(--text-muted)">· draft</span>
          </div>
          <div class="flex items-center gap-1">
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
              icon="i-lucide-more-horizontal"
              aria-label="More options"
            />
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
              icon="i-lucide-x"
              aria-label="Close (Esc)"
              @click="$emit('update:modelValue', false)"
            />
          </div>
        </header>

        <div class="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          <UFormField label="Client" name="client" :error="errorFor('client')">
            <UPopover v-model:open="clientPickerOpen" :ui="{ content: 'w-[440px]' }">
              <button
                type="button"
                class="w-full rounded-md border border-(--border) bg-(--bg-surface) px-3 py-2 flex items-center justify-between text-left hover:border-(--border-strong) focus-visible:outline focus-visible:outline-2 focus-visible:outline-(--green-brand)/40 transition-colors"
                aria-haspopup="listbox"
                :aria-expanded="clientPickerOpen"
                @blur="touched.client = true"
              >
                <span v-if="!selectedClient" class="text-[13px] text-(--text-muted)">Choose a client…</span>
                <span v-else class="flex items-center gap-2.5 min-w-0">
                  <Avatar :initials="selectedClient.initials" :variant="selectedClient.variant" :size="24" />
                  <span class="min-w-0">
                    <span class="block text-[13px] font-medium text-(--text-primary) truncate">{{ selectedClient.name }}</span>
                    <span class="block text-[10.5px] text-(--text-muted) truncate">
                      {{ selectedClient.email || 'No email' }}<template v-if="selectedClient.plan"> · {{ selectedClient.plan }}</template>
                    </span>
                  </span>
                </span>
                <UIcon name="i-lucide-chevron-down" class="size-3.5 text-(--text-muted) shrink-0" />
              </button>

              <template #content>
                <div class="max-h-[320px] overflow-y-auto p-1" role="listbox">
                  <button
                    v-for="client in clients"
                    :key="client.id"
                    type="button"
                    role="option"
                    :aria-selected="client.id === form.client"
                    class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left hover:bg-(--bg-subtle) transition-colors"
                    :class="{ 'bg-(--bg-subtle)': client.id === form.client }"
                    @click="pickClient(client.id)"
                  >
                    <Avatar :initials="client.initials" :variant="client.variant" :size="24" />
                    <span class="min-w-0 flex-1">
                      <span class="block text-[12.5px] font-medium text-(--text-primary) truncate">{{ client.name }}</span>
                      <span class="block text-[10.5px] text-(--text-muted) truncate">
                        {{ client.email || 'No email' }}<template v-if="client.plan"> · {{ client.plan }}</template>
                      </span>
                    </span>
                    <UIcon v-if="client.id === form.client" name="i-lucide-check" class="size-3.5 text-(--green-brand)" />
                  </button>
                  <div v-if="!clients.length" class="px-2.5 py-3 text-[11.5px] text-(--text-muted) text-center">
                    No clients yet
                  </div>
                </div>
              </template>
            </UPopover>
            <template #help>
              <button
                type="button"
                class="mt-1 text-[10.5px] text-(--text-muted) hover:text-(--text-primary) hover:underline"
                @click="onCreateClient"
              >
                + New client
              </button>
            </template>
          </UFormField>

          <UFormField label="Amount" name="amount" :error="errorFor('amount')">
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] font-semibold text-(--text-muted) tabular-nums pointer-events-none">{{ amountSymbol }}</span>
              <input
                v-model.number="form.amount"
                type="number"
                min="0"
                step="500"
                placeholder="0"
                class="w-full rounded-md border border-(--border) bg-(--bg-surface) pl-8 pr-3 py-2.5 text-[20px] font-semibold tabular-nums tracking-tight text-(--text-primary) focus:border-(--green-brand) focus:ring-3 focus:ring-(--green-brand)/15 focus:outline-none"
                @blur="touched.amount = true"
              >
            </div>
            <template #help>
              <div class="mt-1 flex items-center gap-2 text-[10.5px] text-(--text-muted) flex-wrap">
                <button
                  v-for="cents in QUICK_AMOUNTS"
                  :key="cents"
                  type="button"
                  class="rounded-[4px] px-1.5 py-0.5 hover:bg-(--bg-subtle) tabular-nums transition-colors"
                  :class="{ 'bg-(--green-pale) text-(--green-brand) font-semibold': form.amount === cents / 100 }"
                  @click="setQuickAmount(cents)"
                >
                  {{ moneyParts(cents).symbol }}{{ moneyParts(cents).amount }}
                </button>
                <span v-if="selectedClient?.lastInvoiceCents" class="tabular-nums">
                  · client's last invoice: {{ formatMoney(selectedClient.lastInvoiceCents) }}
                </span>
              </div>
            </template>
          </UFormField>

          <details class="group rounded-md border border-(--border)">
            <summary class="flex items-center justify-between px-3 py-2 cursor-pointer rounded-md hover:bg-(--bg-subtle) list-none">
              <span class="flex items-center gap-2">
                <UIcon name="i-lucide-chevron-right" class="size-3 text-(--text-muted) transition-transform group-open:rotate-90" />
                <span class="text-[12px] font-medium text-(--text-primary)">Line items</span>
                <span class="text-[10.5px] text-(--text-muted)">· optional, itemize the amount</span>
              </span>
              <span class="text-[10.5px] text-(--text-muted)">+ Add</span>
            </summary>
            <div class="px-3 pb-3 pt-1 text-[11.5px] text-(--text-muted)">
              Line items aren't supported yet — for now the amount above is what the client sees.
            </div>
          </details>

          <UFormField
            name="description"
            :error="errorFor('description')"
          >
            <template #label>
              <span class="text-[11.5px] font-medium text-(--text-secondary)">
                Description
                <span class="text-(--text-muted) font-normal">· shown to client</span>
              </span>
            </template>
            <UTextarea
              v-model="form.description"
              :rows="2"
              placeholder="June coaching · Week 5 of 12 strength block"
              size="md"
              :maxlength="160"
              class="w-full"
              @blur="touched.description = true"
            />
          </UFormField>

          <UFormField label="Due date" name="dueDate" :error="errorFor('dueDate')" :hint="dueDelta">
            <div class="flex items-center gap-2">
              <input
                v-model="form.dueDate"
                type="date"
                :min="today"
                class="flex-1 rounded-md border border-(--border) bg-(--bg-surface) px-3 py-2 text-[13px] tabular-nums text-(--text-primary) focus:border-(--green-brand) focus:ring-3 focus:ring-(--green-brand)/15 focus:outline-none"
                :aria-label="`Due ${dueLabel}`"
                @blur="touched.dueDate = true"
              >
              <div class="flex items-center gap-1">
                <button
                  v-for="preset in NET_PRESETS"
                  :key="preset.label"
                  type="button"
                  class="rounded-[5px] border px-2 py-1.5 text-[11px] transition-colors"
                  :class="activeNetDays === preset.days
                    ? 'border-(--green-brand) bg-(--green-pale) text-(--green-brand) font-semibold'
                    : 'border-(--border) text-(--text-secondary) hover:bg-(--bg-subtle)'"
                  @click="setNet(preset.days)"
                >
                  {{ preset.label }}
                </button>
              </div>
            </div>
          </UFormField>

          <section aria-labelledby="payment-methods-heading">
            <h3 id="payment-methods-heading" class="block text-[11.5px] font-medium text-(--text-secondary) mb-1.5">
              Payment methods to offer
            </h3>
            <div class="space-y-1.5">
              <label
                v-for="method in paymentMethods"
                :key="method.id"
                class="flex items-center gap-2.5 rounded-md border border-(--border) px-3 py-2 transition-colors"
                :class="method.connected ? 'cursor-pointer hover:bg-(--bg-subtle)' : 'cursor-not-allowed opacity-60'"
              >
                <input
                  type="checkbox"
                  :checked="form.methods.includes(method.id)"
                  :disabled="!method.connected"
                  :aria-label="`Offer ${method.name} as a payment method`"
                  class="rounded accent-(--green-brand) size-3.5"
                  @change="toggleMethod(method.id)"
                >
                <div class="flex-1 min-w-0">
                  <div class="text-[12.5px] font-medium text-(--text-primary)">{{ method.name }}</div>
                  <div class="text-[10.5px] text-(--text-muted) truncate">{{ method.description }}</div>
                </div>
                <span v-if="method.connected" class="text-[10.5px] font-semibold text-(--green-brand) shrink-0">Connected</span>
                <NuxtLink
                  v-else
                  to="/settings#integrations"
                  class="text-[10.5px] font-semibold text-(--info) hover:underline shrink-0"
                  @click.stop
                >
                  Connect →
                </NuxtLink>
              </label>
            </div>
          </section>

          <section aria-labelledby="send-via-heading">
            <h3 id="send-via-heading" class="block text-[11.5px] font-medium text-(--text-secondary) mb-1.5">
              Send via
            </h3>
            <div role="radiogroup" aria-labelledby="send-via-heading" class="flex items-center gap-1">
              <button
                v-for="channel in SEND_VIA"
                :key="channel.id"
                type="button"
                role="radio"
                :aria-checked="form.sendVia === channel.id"
                class="flex-1 rounded-md border px-3 py-2 text-[12px] inline-flex items-center justify-center gap-1.5 transition-colors"
                :class="form.sendVia === channel.id
                  ? 'border-(--green-brand) bg-(--green-pale) text-(--green-brand) font-semibold'
                  : 'border-(--border) text-(--text-secondary) hover:bg-(--bg-subtle)'"
                @click="form.sendVia = channel.id"
              >
                <UIcon :name="channel.icon" class="size-3" />
                {{ channel.label }}
              </button>
            </div>
            <p class="mt-1.5 text-[10.5px] text-(--text-muted)">
              Client receives a link to <span class="font-mono text-[10px]">{{ sendHint }}</span>
            </p>
          </section>

          <button
            type="button"
            class="w-full rounded-md border border-(--border) bg-(--bg-subtle)/60 px-3 py-2.5 flex items-center justify-between hover:bg-(--bg-subtle) transition-colors"
            :disabled="!selectedClient || !isValid"
            @click="onPreview"
          >
            <span class="flex items-center gap-2 min-w-0">
              <UIcon name="i-hugeicons-view" class="size-3 text-(--text-muted) shrink-0" />
              <span class="text-[11.5px] text-(--text-secondary) truncate">
                <template v-if="selectedClient">Preview what {{ selectedClient.name.split(' ')[0] }} will see</template>
                <template v-else>Pick a client to preview</template>
              </span>
            </span>
            <span class="text-[11.5px] font-medium text-(--green-brand) shrink-0">Open →</span>
          </button>
        </div>

        <footer class="flex items-center justify-between px-5 py-3 border-t border-(--border) shrink-0">
          <UButton
            variant="ghost"
            color="neutral"
            size="sm"
            type="button"
            @click="$emit('update:modelValue', false)"
          >
            Cancel
          </UButton>
          <div class="flex items-center gap-2">
            <UButton
              variant="outline"
              color="neutral"
              size="sm"
              type="button"
              @click="submit(true)"
            >
              Save as draft
            </UButton>
            <UButton
              color="neutral"
              variant="solid"
              size="sm"
              :trailing-icon="submitCta.icon"
              type="submit"
            >
              {{ submitCta.label }}
            </UButton>
          </div>
        </footer>
      </form>
    </template>
  </USlideover>
</template>
