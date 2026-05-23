<template>
  <AppTopbar title="Payments">
    <template #actions>
      <UButton variant="outline" color="neutral" class="hover:border-primary hover:text-primary hover:bg-[#F0F9F4] dark:hover:border-(--green-light) dark:hover:text-(--green-light) dark:hover:bg-(--bg-primary-soft)" @click="onExport">
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
      <PaymentStatCard label="Monthly Recurring Revenue" value="$4,820" sub="18 active subscriptions" variant="green">
        <template #icon>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A7A4A" stroke-width="2">
            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
      </PaymentStatCard>

      <PaymentStatCard label="Outstanding Invoices" value="$349" sub="2 invoices overdue" variant="amber">
        <template #icon>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
      </PaymentStatCard>

      <PaymentStatCard label="Paid This Month" value="$4,471" sub="Last payment: 2 hours ago" variant="green">
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
        <div class="text-sm font-bold text-(--text-primary) flex-1">Active Subscriptions ({{ subscriptions.length }})</div>
        <SearchInput v-model="subSearch" placeholder="Search clients…" />
        <UButton color="primary" leading-icon="i-heroicons-plus" @click="drawerOpen = true">Create Invoice</UButton>
      </div>

      <SubscriptionsTable
        :subscriptions="subscriptions"
        :page="subPage"
        :total-pages="3"
        :from="1"
        :to="subscriptions.length"
        :total="18"
        @update:page="subPage = $event"
      />
    </div>

    <!-- Invoices tab -->
    <div v-else-if="activeTab === 'invoices'">
      <InvoiceSummaryChips :chips="summaryChips" />

      <div class="flex items-center gap-3 mb-3.5">
        <div class="text-sm font-bold text-(--text-primary) flex-1">All Invoices ({{ invoices.length }})</div>
        <SearchInput v-model="invSearch" placeholder="Search invoices…" />
        <UButton color="primary" leading-icon="i-heroicons-plus" @click="drawerOpen = true">Create Invoice</UButton>
      </div>

      <InvoicesTable
        :invoices="invoices"
        :page="invPage"
        :total-pages="3"
        :from="1"
        :to="invoices.length"
        :total="12"
        @update:page="invPage = $event"
      />
    </div>

    <!-- Payout history tab -->
    <PayoutHistoryEmpty v-else-if="activeTab === 'payouts'" />
  </div>

  <CreateInvoiceDrawer
    v-model="drawerOpen"
    :clients="clientOptions"
    default-due-date="2026-05-01"
    @submit="onSubmitInvoice"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import AppTopbar from '~/components/AppTopbar.vue'
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

definePageMeta({ layout: 'app' })

const activeTab = ref('subscriptions')
const subSearch = ref('')
const invSearch = ref('')
const subPage = ref(1)
const invPage = ref(1)
const drawerOpen = ref(false)

const tabs: Tab[] = [
  { id: 'subscriptions', label: 'Subscriptions', count: 18 },
  { id: 'invoices',      label: 'Invoices',      count: 12 },
  { id: 'payouts',       label: 'Payout History' },
]

// Icons reused across row dropdowns
const mailIcon = '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>'
const pauseIcon = '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>'
const cancelIcon = '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>'
const downloadIcon = '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>'
const reactivateIcon = '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/></svg>'

const defaultSubActions: ActionItem[] = [
  { label: 'Send Receipt', icon: mailIcon },
  { label: 'Pause Subscription', icon: pauseIcon },
  { divider: true },
  { label: 'Cancel', icon: cancelIcon, danger: true },
]

const overdueSubActions: ActionItem[] = [
  { label: 'Send Payment Reminder', icon: mailIcon },
  { label: 'Pause Subscription', icon: pauseIcon },
  { divider: true },
  { label: 'Cancel', icon: cancelIcon, danger: true },
]

const cancellingSubActions: ActionItem[] = [
  { label: 'Reactivate', icon: reactivateIcon },
  { label: 'Send Receipt', icon: mailIcon },
]

const subscriptions: Subscription[] = [
  { id: 'sr', initials: 'SR', variant: 'a', name: 'Sofia Reyes',     email: 'sofia.reyes@email.com', plan: 'Premium · 3×/wk',  amount: '$350/mo', nextBilling: 'May 1, 2026',  status: 'active',     menuActions: defaultSubActions },
  { id: 'mt', initials: 'MT', variant: 'g', name: 'Marcus Thompson', email: 'marcus.t@email.com',    plan: 'Elite · 5×/wk',    amount: '$480/mo', nextBilling: 'Apr 28, 2026', status: 'active',     menuActions: defaultSubActions },
  { id: 'jl', initials: 'JL', variant: 'e', name: 'James Lowe',      email: 'james.lowe@email.com',  plan: 'Standard · 2×/wk', amount: '$220/mo', nextBilling: 'Apr 14, 2026', status: 'overdue',    lateNote: '3 days overdue', menuActions: overdueSubActions },
  { id: 'lp', initials: 'LP', variant: 'a', name: 'Layla Patel',     email: 'layla.p@email.com',     plan: 'Premium · 3×/wk',  amount: '$350/mo', nextBilling: 'May 3, 2026',  status: 'active',     menuActions: defaultSubActions },
  { id: 'kw', initials: 'KW', variant: 'f', name: 'Kevin Walsh',     email: 'kwalsh@email.com',      plan: 'Standard · 2×/wk', amount: '$220/mo', nextBilling: 'Apr 30, 2026', status: 'cancelling', menuActions: cancellingSubActions },
  { id: 'rn', initials: 'RN', variant: 'c', name: 'Rachel Nguyen',   email: 'rachel.n@email.com',    plan: 'Elite · 5×/wk',    amount: '$480/mo', nextBilling: 'May 5, 2026',  status: 'active',     menuActions: defaultSubActions },
  { id: 'db', initials: 'DB', variant: 'd', name: 'Diana Brooks',    email: 'd.brooks@email.com',    plan: 'Starter · 1×/wk',  amount: '$120/mo', nextBilling: 'May 8, 2026',  status: 'active',     menuActions: defaultSubActions },
  { id: 'tp', initials: 'TP', variant: 'e', name: 'Tyler Park',      email: 'tyler.park@email.com',  plan: 'Premium · 3×/wk',  amount: '$350/mo', nextBilling: 'May 2, 2026',  status: 'active',     menuActions: defaultSubActions },
]

const paidInvoiceActions: ActionItem[] = [
  { label: 'Download PDF', icon: downloadIcon },
  { label: 'Resend', icon: mailIcon },
]

const pendingInvoiceActions: ActionItem[] = [
  { label: 'Send Reminder', icon: mailIcon },
  { label: 'Download PDF', icon: downloadIcon },
  { divider: true },
  { label: 'Void Invoice', icon: cancelIcon, danger: true },
]

const overdueInvoiceActions: ActionItem[] = [
  { label: 'Send Reminder', icon: mailIcon },
  { label: 'Download PDF', icon: downloadIcon },
  { divider: true },
  { label: 'Void Invoice', icon: cancelIcon, danger: true },
]

const invoices: Invoice[] = [
  { id: 'inv-44', number: '#INV-0044', initials: 'SR', variant: 'a', name: 'Sofia Reyes',     description: 'April coaching fee',    amount: '$350.00', sentDate: 'Apr 1, 2026',  dueDate: 'Apr 15, 2026', status: 'paid',    menuActions: paidInvoiceActions },
  { id: 'inv-43', number: '#INV-0043', initials: 'JL', variant: 'e', name: 'James Lowe',      description: 'April coaching fee',    amount: '$149.00', sentDate: 'Apr 1, 2026',  dueDate: 'Apr 14, 2026', status: 'overdue', menuActions: overdueInvoiceActions },
  { id: 'inv-42', number: '#INV-0042', initials: 'MT', variant: 'g', name: 'Marcus Thompson', description: 'April coaching fee',    amount: '$480.00', sentDate: 'Apr 1, 2026',  dueDate: 'Apr 15, 2026', status: 'paid',    menuActions: paidInvoiceActions },
  { id: 'inv-41', number: '#INV-0041', initials: 'LP', variant: 'a', name: 'Layla Patel',     description: 'Nutrition plan add-on', amount: '$200.00', sentDate: 'Apr 10, 2026', dueDate: 'Apr 25, 2026', status: 'pending', menuActions: pendingInvoiceActions },
  { id: 'inv-40', number: '#INV-0040', initials: 'RN', variant: 'c', name: 'Rachel Nguyen',   description: 'April coaching fee',    amount: '$480.00', sentDate: 'Apr 1, 2026',  dueDate: 'Apr 15, 2026', status: 'paid',    menuActions: paidInvoiceActions },
]

const summaryChips: SummaryChip[] = [
  { label: 'Total Invoiced', value: '$5,840', tone: 'green' },
  { label: 'Paid',           value: '$5,491', tone: 'green' },
  { label: 'Pending',        value: '$200',   tone: 'amber' },
  { label: 'Overdue',        value: '$149',   tone: 'red' },
]

const clientOptions: InvoiceClientOption[] = [
  { id: 'sofia',  name: 'Sofia Reyes' },
  { id: 'marcus', name: 'Marcus Thompson' },
  { id: 'james',  name: 'James Lowe' },
  { id: 'layla',  name: 'Layla Patel' },
  { id: 'kevin',  name: 'Kevin Walsh' },
  { id: 'rachel', name: 'Rachel Nguyen' },
  { id: 'diana',  name: 'Diana Brooks' },
  { id: 'tyler',  name: 'Tyler Park' },
]

const onExport = () => { /* TODO: wire to backend export */ }
const onSubmitInvoice = (_payload: InvoicePayload) => { /* TODO: wire to backend */ }
</script>

