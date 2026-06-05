<script setup lang="ts">
import { format } from 'date-fns'
import AppTopbar from '~/components/AppTopbar.vue'
import PaymentsCashflowHero from '~/features/payments/components/PaymentsCashflowHero.vue'
import PaymentsAttentionCard, { type AttentionInvoice } from '~/features/payments/components/PaymentsAttentionCard.vue'
import PaymentsActivityCard, { type ActivityItem } from '~/features/payments/components/PaymentsActivityCard.vue'
import PaymentsInvoiceTable, { type InvoiceRowData } from '~/features/payments/components/PaymentsInvoiceTable.vue'
import CreateInvoiceDrawer, { type InvoiceClientOption, type InvoicePayload } from '~/features/payments/components/CreateInvoiceDrawer.vue'
import { usePaymentsApi } from '~/features/payments/composables/usePaymentsApi'
import { useClientsApi } from '~/features/clients/composables/useClientsApi'
import { hashVariant, clientInitials, clientName } from '~/utils/client'
import { buildMonthBars, derivedStatus, daysFromDue } from '~/features/payments/utils/format'
import type { ModelsClient, ModelsCoachPayment } from '~/services'

definePageMeta({ layout: 'app' })

useSeoMeta({ title: 'Payments | FitCoach CRM' })

type InvoiceFilter = 'all' | 'paid' | 'pending' | 'draft'

const toast = useToast()
const router = useRouter()
const paymentsApi = usePaymentsApi()
const clientsApi = useClientsApi()

const drawerOpen = ref(false)
const invoiceFilter = ref<InvoiceFilter>('all')

const { data, pending, error, refresh } = await useAsyncData('payments-index', () =>
  Promise.all([
    paymentsApi.list({ per_page: 200 }),
    clientsApi.list({ per_page: 200 }),
  ]),
)

const payments = computed<ModelsCoachPayment[]>(() => data.value?.[0]?.payments ?? [])
const clients = computed<ModelsClient[]>(() => data.value?.[1]?.clients ?? [])

const clientMap = computed(() => {
  const map = new Map<string, ModelsClient>()
  for (const c of clients.value) if (c.id) map.set(c.id, c)
  return map
})

const monthBars = computed(() => buildMonthBars(payments.value, 6))

const totalRevenueCents = computed(() =>
  monthBars.value.reduce((sum, bar) => sum + bar.cents, 0),
)

const paidThisMonthCents = computed(() => monthBars.value.at(-1)?.cents ?? 0)
const paidLastMonthCents = computed(() => monthBars.value.at(-2)?.cents ?? 0)

const paidThisMonthDelta = computed(() => {
  const prev = paidLastMonthCents.value
  const curr = paidThisMonthCents.value
  if (!prev) return null
  const pct = Math.round(((curr - prev) / prev) * 100)
  if (pct === 0) return null
  const arrow = pct > 0 ? '↑' : '↓'
  return `${arrow} ${Math.abs(pct)}% vs last month`
})

const outstandingPayments = computed(() =>
  payments.value.filter(p => p.status === 'pending' && p.due_date),
)

const outstandingCents = computed(() =>
  outstandingPayments.value.reduce((sum, p) => sum + (p.amount_cents ?? 0), 0),
)

const outstandingOverdue = computed(() =>
  outstandingPayments.value.filter(p => derivedStatus(p) === 'overdue').length,
)

const activeClientCount = computed(() =>
  clients.value.filter(c => (c.status ?? 'active') === 'active').length,
)

const avgPerClientCents = computed(() =>
  activeClientCount.value ? Math.round(paidThisMonthCents.value / activeClientCount.value) : 0,
)

const attentionInvoices = computed<AttentionInvoice[]>(() =>
  outstandingPayments.value
    .map(payment => {
      const status = derivedStatus(payment)
      if (status !== 'overdue' && status !== 'due-soon') return null
      const client = payment.client_id ? clientMap.value.get(payment.client_id) : undefined
      return {
        payment,
        clientName: clientName(client),
        initials: clientInitials(client),
        variant: hashVariant(payment.client_id ?? payment.id ?? ''),
        status,
        daysFromDue: Math.abs(daysFromDue(payment)),
      } satisfies AttentionInvoice
    })
    .filter((x): x is AttentionInvoice => !!x)
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'overdue' ? -1 : 1
      return b.daysFromDue - a.daysFromDue
    }),
)

const recentActivity = computed<ActivityItem[]>(() => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const items: ActivityItem[] = []
  for (const payment of payments.value) {
    const client = payment.client_id ? clientMap.value.get(payment.client_id) : undefined
    const name = clientName(client)
    if (payment.paid_at && new Date(payment.paid_at) >= sevenDaysAgo) {
      items.push({ payment, clientName: name, kind: 'paid', at: payment.paid_at })
    } else if (payment.sent_at && new Date(payment.sent_at) >= sevenDaysAgo && payment.status !== 'paid') {
      items.push({ payment, clientName: name, kind: 'sent', at: payment.sent_at })
    } else if (payment.status === 'failed' && payment.updated_at && new Date(payment.updated_at) >= sevenDaysAgo) {
      items.push({ payment, clientName: name, kind: 'failed', at: payment.updated_at })
    }
  }
  items.sort((a, b) => b.at.localeCompare(a.at))
  return items.slice(0, 6)
})

const invoiceCounts = computed(() => ({
  all: payments.value.length,
  paid: payments.value.filter(p => p.status === 'paid').length,
  pending: payments.value.filter(p => p.status === 'pending').length,
  draft: payments.value.filter(p => p.status === 'draft').length,
}))

const invoiceRows = computed<InvoiceRowData[]>(() => {
  const filtered = payments.value.filter(payment => {
    if (invoiceFilter.value === 'all') return true
    return payment.status === invoiceFilter.value
  })
  return filtered
    .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
    .slice(0, 6)
    .map(payment => {
      const client = payment.client_id ? clientMap.value.get(payment.client_id) : undefined
      return {
        payment,
        clientName: clientName(client),
        initials: clientInitials(client),
        variant: hashVariant(payment.client_id ?? payment.id ?? ''),
      }
    })
})

const monthLabel = format(new Date(), 'MMMM yyyy')

const lastInvoiceByClient = computed(() => {
  const map = new Map<string, number>()
  for (const payment of payments.value) {
    if (!payment.client_id || !payment.amount_cents) continue
    if (!map.has(payment.client_id)) map.set(payment.client_id, payment.amount_cents)
  }
  return map
})

const clientOptions = computed<InvoiceClientOption[]>(() =>
  clients.value.map(c => ({
    id:       c.id ?? '',
    name:     clientName(c),
    initials: clientInitials(c),
    variant:  hashVariant(c.id ?? ''),
    email:    c.email,
    plan:     c.plan_name || undefined,
    lastInvoiceCents: c.id ? lastInvoiceByClient.value.get(c.id) : undefined,
  })),
)

const defaultDueDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
})

async function onSubmitInvoice(payload: InvoicePayload) {
  try {
    await paymentsApi.create({
      client_id: payload.client || undefined,
      amount_cents: Math.round((payload.amount ?? 0) * 100),
      description: payload.description || undefined,
      due_date: payload.dueDate || undefined,
    })
    toast.add({
      title: payload.saveAsDraft ? 'Invoice saved as draft' : 'Invoice created',
      color: 'success',
    })
    drawerOpen.value = false
    refresh()
  } catch {
    toast.add({ title: 'Failed to create invoice', color: 'error' })
  }
}

function onCreateClient() {
  drawerOpen.value = false
  router.push('/clients?new=1')
}

function onSendReminder(_id: string) {
  toast.add({ title: 'Reminders coming soon', color: 'info' })
}

function onOpen(id: string) {
  router.push(`/payments/invoices?focus=${id}`)
}

function onExport() {
  toast.add({ title: 'Export coming soon', color: 'info' })
}
</script>

<template>
  <AppTopbar title="Payments" :subtitle="monthLabel">
    <template #actions>
      <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-download" @click="onExport">
        Export
      </UButton>
      <UButton color="primary" size="sm" icon="i-lucide-plus" @click="drawerOpen = true">
        Create invoice
      </UButton>
    </template>
  </AppTopbar>

  <main id="main-content" class="flex-1 px-8 py-7 space-y-6 max-md:px-5 max-md:py-5">
    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Failed to load payments"
      :description="error.message"
    />

    <USkeleton v-if="pending" class="h-[260px] rounded-[10px]" />
    <PaymentsCashflowHero
      v-else
      :bars="monthBars"
      :total-cents="totalRevenueCents"
      :paid-this-month-cents="paidThisMonthCents"
      :paid-this-month-delta="paidThisMonthDelta"
      :outstanding-cents="outstandingCents"
      :outstanding-count="outstandingPayments.length"
      :outstanding-overdue="outstandingOverdue"
      :avg-per-client-cents="avgPerClientCents"
      :active-clients="activeClientCount"
    />

    <div class="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
      <template v-if="pending">
        <USkeleton class="h-[280px] rounded-[10px]" />
        <USkeleton class="h-[280px] rounded-[10px]" />
      </template>
      <template v-else>
        <PaymentsAttentionCard
          :invoices="attentionInvoices"
          @send-reminder="onSendReminder"
          @view="onOpen"
        />
        <PaymentsActivityCard :items="recentActivity" />
      </template>
    </div>

    <section
      v-if="!pending"
      aria-labelledby="all-invoices-heading"
      class="rounded-[10px] border border-(--border) bg-(--bg-surface) overflow-hidden"
    >
      <header class="flex items-center justify-between border-b border-(--border) px-5 py-3 gap-3 flex-wrap">
        <div class="flex items-center gap-5">
          <h3 id="all-invoices-heading" class="text-[13px] font-semibold text-(--text-primary)">
            All invoices
          </h3>
          <div class="flex items-center gap-1">
            <button
              v-for="opt in (['all', 'paid', 'pending', 'draft'] as const)"
              :key="opt"
              type="button"
              class="rounded-md px-2 py-0.5 text-[11.5px]"
              :class="invoiceFilter === opt
                ? 'bg-(--bg-subtle) text-(--text-primary) font-medium'
                : 'text-(--text-secondary) hover:bg-(--bg-subtle)'"
              @click="invoiceFilter = opt"
            >
              {{ opt.charAt(0).toUpperCase() + opt.slice(1) }}
              <span class="ml-1 tabular-nums text-(--text-muted)">{{ invoiceCounts[opt] }}</span>
            </button>
          </div>
        </div>
        <NuxtLink
          to="/payments/invoices"
          class="text-[11.5px] text-(--text-muted) hover:text-(--text-primary) no-underline"
        >
          Expand ledger →
        </NuxtLink>
      </header>
      <PaymentsInvoiceTable :rows="invoiceRows" :compact="true" @open="onOpen" />
    </section>
  </main>

  <CreateInvoiceDrawer
    v-model="drawerOpen"
    :clients="clientOptions"
    :default-due-date="defaultDueDate"
    @submit="onSubmitInvoice"
    @create-client="onCreateClient"
  />
</template>
