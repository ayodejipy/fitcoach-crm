<script setup lang="ts">
import AppTopbar from '~/components/AppTopbar.vue'
import PaymentsInvoiceTable, { type InvoiceRowData } from '~/features/payments/components/PaymentsInvoiceTable.vue'
import CreateInvoiceDrawer, { type InvoiceClientOption, type InvoicePayload } from '~/features/payments/components/CreateInvoiceDrawer.vue'
import { usePaymentsApi } from '~/features/payments/composables/usePaymentsApi'
import { useClientsApi } from '~/features/clients/composables/useClientsApi'
import { hashVariant, clientInitials, clientName } from '~/utils/client'
import {
  derivedStatus,
  formatMoney,
  moneyParts,
  type DerivedStatus,
} from '~/features/payments/utils/format'
import type { ModelsClient, ModelsCoachPayment } from '~/services'

definePageMeta({ layout: 'app' })

useSeoMeta({ title: 'Invoices | FitCoach CRM' })

type LedgerFilter = 'all' | 'overdue' | 'due-soon' | 'paid' | 'draft'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const paymentsApi = usePaymentsApi()
const clientsApi = useClientsApi()

const drawerOpen = ref(false)
const ledgerFilter = computed<LedgerFilter>({
  get: () => (route.query.filter as LedgerFilter) || 'all',
  set: (val) => router.replace({ query: { ...route.query, filter: val } }),
})
const search = ref((route.query.q as string) || '')

const { data, pending, error, refresh } = await useAsyncData('payments-ledger', () =>
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

const filterCounts = computed(() => {
  const counts: Record<LedgerFilter, number> = { all: 0, overdue: 0, 'due-soon': 0, paid: 0, draft: 0 }
  counts.all = payments.value.length
  for (const payment of payments.value) {
    const s = derivedStatus(payment)
    if (s === 'overdue') counts.overdue++
    else if (s === 'due-soon') counts['due-soon']++
    else if (s === 'paid') counts.paid++
    else if (s === 'draft') counts.draft++
  }
  return counts
})

const rows = computed<InvoiceRowData[]>(() => {
  const q = search.value.trim().toLowerCase()
  return payments.value
    .filter(payment => {
      if (ledgerFilter.value !== 'all') {
        if (derivedStatus(payment) !== ledgerFilter.value as DerivedStatus) return false
      }
      if (!q) return true
      const client = payment.client_id ? clientMap.value.get(payment.client_id) : undefined
      const name = clientName(client).toLowerCase()
      return (
        name.includes(q)
        || (payment.invoice_number ?? '').toLowerCase().includes(q)
        || (payment.description ?? '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
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

const kpiOutstandingCents = computed(() =>
  payments.value
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + (p.amount_cents ?? 0), 0),
)

const kpiPaidThisMonthCents = computed(() => {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  return payments.value
    .filter(p => p.status === 'paid' && p.paid_at && new Date(p.paid_at) >= monthStart)
    .reduce((sum, p) => sum + (p.amount_cents ?? 0), 0)
})

const subtitle = computed(() => {
  const overdue = filterCounts.value.overdue
  const dueSoon = filterCounts.value['due-soon']
  const flagged = overdue + dueSoon
  if (flagged === 0) return `${payments.value.length} ${payments.value.length === 1 ? 'invoice' : 'invoices'} · all current`
  return `${flagged} ${flagged === 1 ? 'invoice' : 'invoices'} need attention`
})

const FILTER_TABS = [
  { id: 'all',       label: 'All',       dot: '' },
  { id: 'overdue',   label: 'Overdue',   dot: 'bg-(--red)' },
  { id: 'due-soon',  label: 'Due soon',  dot: 'bg-(--warning)' },
  { id: 'paid',      label: 'Paid',      dot: 'bg-(--green-brand)' },
  { id: 'draft',     label: 'Draft',     dot: 'bg-(--text-muted)' },
] as const

const clientOptions = computed<InvoiceClientOption[]>(() =>
  clients.value.map(c => ({ id: c.id ?? '', name: clientName(c) })),
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
    toast.add({ title: 'Invoice created', color: 'success' })
    drawerOpen.value = false
    refresh()
  } catch {
    toast.add({ title: 'Failed to create invoice', color: 'error' })
  }
}

function onOpen(id: string) {
  toast.add({ title: 'Invoice detail view coming soon', color: 'info' })
}

function onExport() {
  toast.add({ title: 'Export coming soon', color: 'info' })
}
</script>

<template>
  <AppTopbar>
    <template #title>
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-[12.5px] min-w-0">
        <NuxtLink to="/payments" class="text-(--text-muted) hover:text-(--text-primary) no-underline">Payments</NuxtLink>
        <span aria-hidden="true" class="text-(--text-muted)">/</span>
        <span class="font-semibold text-(--text-primary)">Invoices</span>
      </nav>
      <span class="ml-2 text-[11px] text-(--text-muted) tabular-nums">· {{ subtitle }}</span>
    </template>
    <template #actions>
      <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-download" @click="onExport">
        Export
      </UButton>
      <UButton color="primary" size="sm" icon="i-lucide-plus" @click="drawerOpen = true">
        Create invoice
      </UButton>
    </template>
  </AppTopbar>

  <div class="px-8 py-4 border-b border-(--border) bg-(--bg-surface) max-md:px-5">
    <div class="flex items-center gap-8 flex-wrap">
      <div>
        <div class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted)">Outstanding</div>
        <div class="mt-0.5 flex items-baseline gap-1.5">
          <span class="text-[20px] font-semibold tabular-nums tracking-tight">{{ formatMoney(kpiOutstandingCents) }}</span>
          <span v-if="filterCounts.overdue" class="text-[11px] text-(--warning)">· {{ filterCounts.overdue }} overdue</span>
        </div>
      </div>
      <div class="h-8 w-px bg-(--border)" />
      <div>
        <div class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted)">Paid this month</div>
        <div class="mt-0.5 flex items-baseline gap-1.5">
          <span class="text-[20px] font-semibold tabular-nums tracking-tight">{{ formatMoney(kpiPaidThisMonthCents) }}</span>
        </div>
      </div>
      <div class="h-8 w-px bg-(--border)" />
      <div>
        <div class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted)">Total invoiced</div>
        <div class="mt-0.5 flex items-baseline gap-1.5">
          <span class="text-[20px] font-semibold tabular-nums tracking-tight">{{ formatMoney(payments.reduce((s, p) => s + (p.amount_cents ?? 0), 0)) }}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="px-8 py-3 border-b border-(--border) bg-(--bg-surface) flex items-center justify-between gap-3 max-md:px-5 max-md:flex-wrap">
    <div class="flex items-center gap-1">
      <button
        v-for="tab in FILTER_TABS"
        :key="tab.id"
        type="button"
        class="rounded-md px-2.5 py-1 text-[12px] inline-flex items-center gap-1.5"
        :class="ledgerFilter === tab.id
          ? 'bg-(--bg-subtle) text-(--text-primary) font-medium'
          : 'text-(--text-secondary) hover:bg-(--bg-subtle)'"
        @click="ledgerFilter = tab.id"
      >
        <span v-if="tab.dot" aria-hidden="true" class="h-1.5 w-1.5 rounded-full" :class="tab.dot" />
        {{ tab.label }}
        <span class="tabular-nums text-(--text-muted)">{{ filterCounts[tab.id] }}</span>
      </button>
    </div>
    <UInput
      v-model="search"
      placeholder="Search invoices…"
      icon="i-lucide-search"
      size="sm"
      class="w-[240px]"
    />
  </div>

  <main id="main-content" class="flex-1 px-8 py-6 max-md:px-5">
    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Failed to load invoices"
      :description="error.message"
    />

    <USkeleton v-if="pending" class="h-[400px] rounded-[10px]" />

    <section v-else class="rounded-[10px] border border-(--border) bg-(--bg-surface) overflow-hidden">
      <PaymentsInvoiceTable :rows="rows" @open="onOpen" />
    </section>
  </main>

  <CreateInvoiceDrawer
    v-model="drawerOpen"
    :clients="clientOptions"
    :default-due-date="defaultDueDate"
    @submit="onSubmitInvoice"
  />
</template>
