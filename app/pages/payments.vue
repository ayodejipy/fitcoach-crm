<template>
  <AppTopbar title="Payments">
    <template #actions>
      <UButton
        variant="outline"
        color="neutral"
        class="hover:border-primary hover:text-primary hover:bg-[#F0F9F4] dark:hover:border-(--green-light) dark:hover:text-(--green-light) dark:hover:bg-(--bg-primary-soft)"
        @click="onExport"
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
        Export
      </UButton>
      <UButton color="primary" leading-icon="i-heroicons-plus" @click="drawerOpen = true">Create Invoice</UButton>
    </template>
  </AppTopbar>

  <div class="py-7 px-8 flex-1">
    <!-- Stat bar -->
    <div class="grid grid-cols-3 gap-4 mb-6 max-[900px]:grid-cols-1">
      <PaymentStatCard :label="'Monthly Recurring Revenue'" :value="stats.mrr" :sub="`${stats.activeSubs} active subscriptions`" variant="green">
        <template #icon>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A7A4A" stroke-width="2">
            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
      </PaymentStatCard>

      <PaymentStatCard :label="'Outstanding Invoices'" :value="stats.outstanding" :sub="`${stats.overdueCount} invoice${stats.overdueCount !== 1 ? 's' : ''} overdue`" variant="amber">
        <template #icon>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
      </PaymentStatCard>

      <PaymentStatCard :label="'Paid This Month'" :value="stats.paidThisMonth" :sub="`Last payment: ${stats.lastPaymentSub}`" variant="green">
        <template #icon>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A7A4A" stroke-width="2">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
      </PaymentStatCard>
    </div>

    <!-- Tabs -->
    <PaymentsTabs v-model="activeTab" :tabs="tabs" />

    <!-- Subscriptions tab -->
    <div v-if="activeTab === 'subscriptions'">
      <div class="flex items-center gap-3 mb-3.5">
        <div class="text-sm font-bold text-(--text-primary) flex-1">
          Active Subscriptions ({{ filteredSubscriptions.length }})
        </div>
        <SearchInput v-model="subSearch" placeholder="Search clients…" />
        <UButton color="primary" leading-icon="i-heroicons-plus" @click="drawerOpen = true">Create Invoice</UButton>
      </div>

      <SubscriptionsTable
        :subscriptions="pagedSubscriptions"
        :page="subPage"
        :total-pages="subTotalPages"
        :from="subFrom"
        :to="subTo"
        :total="filteredSubscriptions.length"
        @update:page="subPage = $event"
      />
    </div>

    <!-- Invoices tab -->
    <div v-else-if="activeTab === 'invoices'">
      <InvoiceSummaryChips :chips="summaryChips" />

      <div class="flex items-center gap-3 mb-3.5">
        <div class="text-sm font-bold text-(--text-primary) flex-1">
          All Invoices ({{ filteredInvoices.length }})
        </div>
        <SearchInput v-model="invSearch" placeholder="Search invoices…" />
        <UButton color="primary" leading-icon="i-heroicons-plus" @click="drawerOpen = true">Create Invoice</UButton>
      </div>

      <InvoicesTable
        :invoices="pagedInvoices"
        :page="invPage"
        :total-pages="invTotalPages"
        :from="invFrom"
        :to="invTo"
        :total="filteredInvoices.length"
        @update:page="invPage = $event"
      />
    </div>

    <!-- Payout history tab -->
    <PayoutHistoryEmpty v-else-if="activeTab === 'payouts'" />
  </div>

  <CreateInvoiceDrawer
    v-model="drawerOpen"
    :clients="clientOptions"
    :default-due-date="defaultDueDate"
    @submit="onSubmitInvoice"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import SearchInput from '~/components/SearchInput.vue'
import PaymentStatCard from '~/features/payments/components/PaymentStatCard.vue'
import PaymentsTabs, { type Tab } from '~/features/payments/components/PaymentsTabs.vue'
import SubscriptionsTable from '~/features/payments/components/SubscriptionsTable.vue'
import InvoicesTable from '~/features/payments/components/InvoicesTable.vue'
import InvoiceSummaryChips, { type SummaryChip } from '~/features/payments/components/InvoiceSummaryChips.vue'
import PayoutHistoryEmpty from '~/features/payments/components/PayoutHistoryEmpty.vue'
import CreateInvoiceDrawer, { type InvoiceClientOption, type InvoicePayload } from '~/features/payments/components/CreateInvoiceDrawer.vue'
import type { Subscription } from '~/features/payments/components/SubscriptionRow.vue'
import type { Invoice } from '~/features/payments/components/InvoiceRow.vue'
import type { ActionItem } from '~/features/clients/components/ClientActionsMenu.vue'
import { usePaymentsApi } from '~/features/payments/composables/usePaymentsApi'
import { useClientsApi } from '~/features/clients/composables/useClientsApi'

definePageMeta({ layout: 'app' })

const toast = useToast()
const paymentsApi = usePaymentsApi()
const clientsApi = useClientsApi()

const activeTab = ref('subscriptions')
const subSearch = ref('')
const invSearch = ref('')
const subPage = ref(1)
const invPage = ref(1)
const drawerOpen = ref(false)
const PAGE_SIZE = 15

// --- Data fetching ---

const { data: subscriptionsData, refresh: refreshSubs } = useAsyncData(
  'payments-subscriptions',
  () => paymentsApi.list({ payment_type: 'subscription', per_page: 100 }),
)

const { data: invoicesData, refresh: refreshInvoices } = useAsyncData(
  'payments-invoices',
  () => paymentsApi.list({ payment_type: 'invoice', per_page: 100 }),
)

const { data: clientsData } = useAsyncData(
  'payments-clients',
  () => clientsApi.list({ per_page: 200 }),
)

// Reset pages when search changes
watch(subSearch, () => { subPage.value = 1 })
watch(invSearch, () => { invPage.value = 1 })

// --- Helpers ---

const AVATAR_VARIANTS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const

function variantForId(id: string): typeof AVATAR_VARIANTS[number] {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xff
  return AVATAR_VARIANTS[hash % AVATAR_VARIANTS.length] as typeof AVATAR_VARIANTS[number]
}

function mkInitials(firstName?: string, lastName?: string): string {
  return `${(firstName ?? '').charAt(0)}${(lastName ?? '').charAt(0)}`.toUpperCase() || '??'
}

function formatAmount(cents?: number): string {
  if (!cents) return '$0'
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function formatDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso.includes('T') ? iso : iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysLate(dateStr?: string): number {
  if (!dateStr) return 0
  const due = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00')
  return Math.max(0, Math.floor((Date.now() - due.getTime()) / 86400000))
}

// --- Client map ---

const clientMap = computed(() => {
  const map = new Map<string, {
    name: string
    email: string
    initials: string
    variant: typeof AVATAR_VARIANTS[number]
    planName: string
  }>()
  for (const c of (clientsData.value?.clients ?? [])) {
    if (!c.id) continue
    map.set(c.id, {
      name: `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || 'Unknown',
      email: c.email ?? '',
      initials: mkInitials(c.first_name, c.last_name),
      variant: variantForId(c.id),
      planName: c.plan_name ?? '',
    })
  }
  return map
})

// --- Icons ---

const mailIcon = '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>'
const pauseIcon = '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>'
const cancelIcon = '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>'
const downloadIcon = '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>'
const reactivateIcon = '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/></svg>'
const checkIcon = '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>'

// --- API actions ---

async function cancelOrActivate(id: string, status: 'cancelling' | 'active') {
  try {
    await paymentsApi.update(id, { status })
    await refreshSubs()
  } catch {
    toast.add({ title: 'Failed to update subscription', color: 'error' })
  }
}

async function markInvoicePaid(id: string) {
  try {
    await paymentsApi.markPaid(id)
    await refreshInvoices()
  } catch {
    toast.add({ title: 'Failed to mark as paid', color: 'error' })
  }
}

async function voidInvoice(id: string) {
  try {
    await paymentsApi.update(id, { status: 'failed' })
    await refreshInvoices()
  } catch {
    toast.add({ title: 'Failed to void invoice', color: 'error' })
  }
}

// --- Menu action builders ---

function buildSubActions(id: string, status: string): ActionItem[] {
  if (status === 'cancelling') {
    return [
      { label: 'Reactivate', icon: reactivateIcon, onClick: () => cancelOrActivate(id, 'active') },
      { label: 'Send Receipt', icon: mailIcon },
    ]
  }
  if (status === 'overdue') {
    return [
      { label: 'Send Payment Reminder', icon: mailIcon },
      { label: 'Pause Subscription', icon: pauseIcon, onClick: () => cancelOrActivate(id, 'cancelling') },
      { divider: true },
      { label: 'Cancel', icon: cancelIcon, danger: true, onClick: () => cancelOrActivate(id, 'cancelling') },
    ]
  }
  return [
    { label: 'Send Receipt', icon: mailIcon },
    { label: 'Pause Subscription', icon: pauseIcon, onClick: () => cancelOrActivate(id, 'cancelling') },
    { divider: true },
    { label: 'Cancel', icon: cancelIcon, danger: true, onClick: () => cancelOrActivate(id, 'cancelling') },
  ]
}

function buildInvoiceActions(id: string, status: string): ActionItem[] {
  if (status === 'paid') {
    return [
      { label: 'Download PDF', icon: downloadIcon },
      { label: 'Resend', icon: mailIcon },
    ]
  }
  return [
    { label: 'Mark as Paid', icon: checkIcon, onClick: () => markInvoicePaid(id) },
    { label: 'Send Reminder', icon: mailIcon },
    { label: 'Download PDF', icon: downloadIcon },
    { divider: true },
    { label: 'Void Invoice', icon: cancelIcon, danger: true, onClick: () => voidInvoice(id) },
  ]
}

// --- Subscriptions ---

const allSubscriptions = computed<Subscription[]>(() =>
  (subscriptionsData.value?.payments ?? []).map(p => {
    const client = clientMap.value.get(p.client_id ?? '')
    const days = p.status === 'overdue' ? daysLate(p.due_date) : 0
    return {
      id: p.id ?? '',
      initials: client?.initials ?? '??',
      variant: client?.variant ?? 'a',
      name: client?.name ?? 'Unknown',
      email: client?.email ?? '',
      plan: client?.planName || p.description || 'Plan',
      amount: `${formatAmount(p.amount_cents ?? 0)}/mo`,
      nextBilling: formatDate(p.next_billing_date),
      status: (p.status ?? 'active') as Subscription['status'],
      lateNote: days > 0 ? `${days} day${days !== 1 ? 's' : ''} overdue` : undefined,
      menuActions: buildSubActions(p.id ?? '', p.status ?? ''),
    }
  })
)

const filteredSubscriptions = computed(() => {
  const q = subSearch.value.trim().toLowerCase()
  if (!q) return allSubscriptions.value
  return allSubscriptions.value.filter(s =>
    s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
  )
})

const subTotalPages = computed(() => Math.max(1, Math.ceil(filteredSubscriptions.value.length / PAGE_SIZE)))
const subFrom = computed(() => filteredSubscriptions.value.length === 0 ? 0 : (subPage.value - 1) * PAGE_SIZE + 1)
const subTo = computed(() => Math.min(subPage.value * PAGE_SIZE, filteredSubscriptions.value.length))
const pagedSubscriptions = computed(() =>
  filteredSubscriptions.value.slice((subPage.value - 1) * PAGE_SIZE, subPage.value * PAGE_SIZE),
)

// --- Invoices ---

const allInvoices = computed<Invoice[]>(() =>
  (invoicesData.value?.payments ?? []).map(p => {
    const client = clientMap.value.get(p.client_id ?? '')
    return {
      id: p.id ?? '',
      number: p.invoice_number ? `#${p.invoice_number}` : `#${(p.id ?? '').slice(0, 8).toUpperCase()}`,
      initials: client?.initials ?? '??',
      variant: client?.variant ?? 'a',
      name: client?.name ?? 'Unknown',
      description: p.description ?? '—',
      amount: `$${((p.amount_cents ?? 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sentDate: formatDate(p.sent_at),
      dueDate: formatDate(p.due_date),
      status: (p.status ?? 'pending') as Invoice['status'],
      menuActions: buildInvoiceActions(p.id ?? '', p.status ?? ''),
    }
  })
)

const filteredInvoices = computed(() => {
  const q = invSearch.value.trim().toLowerCase()
  if (!q) return allInvoices.value
  return allInvoices.value.filter(i =>
    i.name.toLowerCase().includes(q) ||
    i.number.toLowerCase().includes(q) ||
    i.description.toLowerCase().includes(q),
  )
})

const invTotalPages = computed(() => Math.max(1, Math.ceil(filteredInvoices.value.length / PAGE_SIZE)))
const invFrom = computed(() => filteredInvoices.value.length === 0 ? 0 : (invPage.value - 1) * PAGE_SIZE + 1)
const invTo = computed(() => Math.min(invPage.value * PAGE_SIZE, filteredInvoices.value.length))
const pagedInvoices = computed(() =>
  filteredInvoices.value.slice((invPage.value - 1) * PAGE_SIZE, invPage.value * PAGE_SIZE),
)

// --- Stats ---

const stats = computed(() => {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const subs = subscriptionsData.value?.payments ?? []
  const invs = invoicesData.value?.payments ?? []

  const mrr = subs
    .filter(p => p.status === 'active')
    .reduce((sum, p) => sum + (p.amount_cents ?? 0), 0)

  const activeSubs = subs.filter(p => p.status === 'active').length

  const outstanding = invs
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + (p.amount_cents ?? 0), 0)

  const overdueCount = invs.filter(p => p.status === 'overdue').length

  const paidThisMonth = invs
    .filter(p => p.status === 'paid' && p.paid_at && new Date(p.paid_at) >= monthStart)
    .reduce((sum, p) => sum + (p.amount_cents ?? 0), 0)

  const lastPaid = invs
    .filter(p => p.status === 'paid' && p.paid_at)
    .sort((a, b) => new Date(b.paid_at!).getTime() - new Date(a.paid_at!).getTime())[0]

  const lastPaymentSub = lastPaid?.paid_at
    ? (() => {
        const diff = Math.floor((Date.now() - new Date(lastPaid.paid_at!).getTime()) / 60000)
        if (diff < 60) return `${diff} min ago`
        if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`
        return `${Math.floor(diff / 1440)} day${Math.floor(diff / 1440) !== 1 ? 's' : ''} ago`
      })()
    : 'No recent payments'

  return { mrr: formatAmount(mrr), activeSubs, outstanding: formatAmount(outstanding), overdueCount, paidThisMonth: formatAmount(paidThisMonth), lastPaymentSub }
})

// --- Summary chips ---

const summaryChips = computed<SummaryChip[]>(() => {
  const invs = invoicesData.value?.payments ?? []
  const total = invs.reduce((s, p) => s + (p.amount_cents ?? 0), 0)
  const paid = invs.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount_cents ?? 0), 0)
  const pending = invs.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount_cents ?? 0), 0)
  const overdue = invs.filter(p => p.status === 'overdue').reduce((s, p) => s + (p.amount_cents ?? 0), 0)
  return [
    { label: 'Total Invoiced', value: formatAmount(total), tone: 'green' },
    { label: 'Paid',           value: formatAmount(paid),  tone: 'green' },
    { label: 'Pending',        value: formatAmount(pending), tone: 'amber' },
    { label: 'Overdue',        value: formatAmount(overdue), tone: 'red' },
  ]
})

// --- Tabs ---

const tabs = computed<Tab[]>(() => [
  { id: 'subscriptions', label: 'Subscriptions', count: subscriptionsData.value?.total ?? allSubscriptions.value.length },
  { id: 'invoices',      label: 'Invoices',      count: invoicesData.value?.total ?? allInvoices.value.length },
  { id: 'payouts',       label: 'Payout History' },
])

// --- Client options for drawer ---

const clientOptions = computed<InvoiceClientOption[]>(() =>
  (clientsData.value?.clients ?? []).map(c => ({
    id: c.id ?? '',
    name: `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || 'Unknown',
  })),
)

// --- Default due date: 30 days from today ---

const defaultDueDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
})

// --- Handlers ---

async function onSubmitInvoice(payload: InvoicePayload) {
  try {
    await paymentsApi.create({
      client_id: payload.client || undefined,
      amount_cents: Math.round((payload.amount ?? 0) * 100),
      description: payload.description || undefined,
      due_date: payload.dueDate || undefined,
    })
    toast.add({ title: 'Invoice created', color: 'success' })
    await refreshInvoices()
    activeTab.value = 'invoices'
  } catch {
    toast.add({ title: 'Failed to create invoice', color: 'error' })
  }
}

function onExport() {
  toast.add({ title: 'Export coming soon', color: 'neutral' })
}
</script>
