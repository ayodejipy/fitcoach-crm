<script setup lang="ts">
import SettingsSection from './SettingsSection.vue'

const toast = useToast()

const PROVIDERS = [
  {
    id: 'paystack',
    name: 'Paystack',
    initials: 'PS',
    bg: '#0BA4DB',
    description: 'Card, transfer, USSD, mobile money',
    fee: '1.5% + ₦100',
    connected: false,
  },
  {
    id: 'bank',
    name: 'Bank transfer',
    icon: 'i-lucide-landmark',
    description: 'Zero fees · manual confirmation',
    fee: 'No fee',
    connected: false,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    initials: 'S',
    bg: '#635BFF',
    description: 'For international clients · USD/EUR/GBP',
    fee: '2.9% + 30¢',
    connected: false,
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    initials: 'FW',
    bg: '#F5A623',
    description: 'Pan-African · NGN, GHS, KES, ZAR, USD',
    fee: '1.4% local / 3.8% international',
    connected: false,
  },
] as const

const autoRemind = ref(true)
const defaultDueWindow = ref('14')

const DUE_OPTIONS = [
  { value: '7',  label: '7 days' },
  { value: '14', label: '14 days' },
  { value: '30', label: '30 days' },
  { value: '60', label: '60 days' },
]

function onConnect(name: string) {
  toast.add({ title: `${name} connection coming soon`, color: 'info' })
}
</script>

<template>
  <SettingsSection
    id="payment-methods"
    title="Payment methods"
    description="Connect providers your clients can use to pay you. FitCoach never sees card numbers or holds funds."
  >
    <template #badge>
      <UBadge label="0 connected" color="neutral" variant="soft" size="sm" />
    </template>

    <div
      v-for="provider in PROVIDERS"
      :key="provider.id"
      class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-4 flex items-start gap-3"
    >
      <div
        v-if="provider.initials"
        class="inline-flex h-9 w-9 items-center justify-center rounded-md text-white font-bold text-[11px] shrink-0"
        :style="{ background: provider.bg }"
      >
        {{ provider.initials }}
      </div>
      <div
        v-else
        class="inline-flex h-9 w-9 items-center justify-center rounded-md bg-(--bg-subtle) text-(--text-secondary) shrink-0"
      >
        <UIcon :name="provider.icon!" class="size-4" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-[13px] font-semibold text-(--text-primary)">{{ provider.name }}</div>
        <p class="mt-0.5 text-[11.5px] text-(--text-secondary)">{{ provider.description }}</p>
        <p class="mt-0.5 text-[10.5px] text-(--text-muted) tabular-nums">{{ provider.fee }}</p>
      </div>
      <UButton color="neutral" variant="outline" size="sm" @click="onConnect(provider.name)">
        Connect
      </UButton>
    </div>

    <div class="mt-4 pt-4 border-t border-(--border-muted) space-y-3">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div class="text-[12px] font-medium text-(--text-primary)">Default due window on new invoices</div>
        </div>
        <USelect
          v-model="defaultDueWindow"
          :items="DUE_OPTIONS"
          value-key="value"
          label-key="label"
          size="sm"
          class="w-32"
        />
      </div>
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div class="min-w-0 flex-1">
          <div class="text-[12px] font-medium text-(--text-primary)">Auto-remind overdue invoices</div>
          <div class="text-[10.5px] text-(--text-muted)">Email the client 3, 7, and 14 days after due date</div>
        </div>
        <USwitch v-model="autoRemind" />
      </div>
    </div>
  </SettingsSection>
</template>
