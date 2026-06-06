<script setup lang="ts">
import StepHeader from '../StepHeader.vue'
import { useIntegrationsApi } from '~/composables/useIntegrationsApi'

const props = defineProps<{
  form: {
    connectedItems: string[]
  }
}>()

const toast = useToast()

const PAYMENT_PROVIDERS = [
  {
    id: 'paystack',
    name: 'Paystack',
    initials: 'PS',
    bg: '#0BA4DB',
    description: 'Cards · Bank transfer · USSD · Best for Nigeria',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    initials: 'S',
    bg: '#635BFF',
    description: 'Cards · Apple Pay · Google Pay · International',
  },
  {
    id: 'bank',
    name: 'Bank transfer',
    icon: 'i-lucide-landmark',
    description: 'Manual reconcile · always works · no fees',
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    initials: 'FW',
    bg: '#F5A623',
    description: 'Africa-wide · Cards · Mobile money · Bank',
  },
] as const

const TOOL_INTEGRATIONS = [
  {
    id: 'zoom',
    name: 'Zoom',
    initials: 'Z',
    bg: '#2D8CFF',
    description: 'Auto-generate meeting links for every session',
  },
  {
    id: 'gcal',
    name: 'Google Calendar',
    initials: 'G',
    bg: 'linear-gradient(135deg, #4285F4, #34A853)',
    description: "Sync sessions to your calendar — and your clients'",
  },
] as const

function isConnected(id: string): boolean {
  return props.form.connectedItems.includes(id)
}

const integrationsApi = useIntegrationsApi()
const startingGoogle = ref(false)

async function toggleConnect(id: string, name: string) {
  // Google Calendar is the only real OAuth flow today (Stage 1 of GCal
  // integration). Everything else stays the local-mock UX the onboarding
  // step originally shipped with — backend wiring lands per-provider.
  if (id === 'gcal') {
    if (isConnected(id)) {
      try {
        await integrationsApi.disconnectGoogle()
        props.form.connectedItems = props.form.connectedItems.filter(x => x !== id)
        toast.add({ title: 'Google Calendar disconnected', color: 'neutral' })
      } catch {
        toast.add({ title: 'Could not disconnect — try again', color: 'error' })
      }
      return
    }
    startingGoogle.value = true
    try {
      const res = await integrationsApi.startGoogle()
      if (res?.authorize_url) {
        window.location.href = res.authorize_url
        return
      }
      toast.add({ title: 'Google Calendar not configured on this deployment', color: 'warning' })
    } catch {
      toast.add({ title: 'Could not start Google sign-in', color: 'error' })
    } finally {
      startingGoogle.value = false
    }
    return
  }

  // Non-Google providers stay on the mock UX for now.
  if (isConnected(id)) {
    props.form.connectedItems = props.form.connectedItems.filter(x => x !== id)
    toast.add({ title: `${name} disconnected`, color: 'neutral' })
  } else {
    props.form.connectedItems.push(id)
    toast.add({ title: `${name} connected (mock)`, description: 'Real OAuth flow coming after launch.', color: 'success' })
  }
}
</script>

<template>
  <div class="flex-1 px-10 py-10 overflow-y-auto max-md:px-5">
    <div class="max-w-[560px] mx-auto">
      <StepHeader
        title="Connect payments &amp; tools"
        sub="All optional. You can connect any of these later in Settings → Integrations."
      />

      <div class="space-y-8">
        <section aria-labelledby="payments-group">
          <div class="flex items-center gap-2.5 mb-3 flex-wrap">
            <span class="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-(--green-pale)">
              <UIcon name="i-lucide-credit-card" class="size-3 text-(--green-brand)" />
            </span>
            <h3 id="payments-group" class="text-[13.5px] font-semibold text-(--text-primary)">Payments</h3>
            <span class="text-[11px] text-(--text-muted)">how clients pay invoices · pick zero or many</span>
          </div>
          <p class="text-[11.5px] text-(--text-secondary) mb-3 leading-relaxed">
            FitCoach doesn't store cards. When you create an invoice, your client picks how to pay — from the providers you've connected here.
          </p>

          <div class="space-y-2">
            <div
              v-for="provider in PAYMENT_PROVIDERS"
              :key="provider.id"
              class="flex items-center gap-3.5 rounded-[10px] border-[1.5px] px-4 py-3 transition-colors"
              :class="isConnected(provider.id)
                ? 'border-(--green-brand) bg-(--green-pale)'
                : 'border-(--border)'"
            >
              <div
                v-if="'initials' in provider"
                class="h-10 w-10 rounded-md flex items-center justify-center shrink-0 text-white font-bold text-[14px]"
                :style="{ background: provider.bg }"
              >
                {{ provider.initials }}
              </div>
              <div
                v-else
                class="h-10 w-10 rounded-md flex items-center justify-center shrink-0 bg-(--bg-subtle) text-(--text-secondary)"
              >
                <UIcon :name="provider.icon" class="size-4" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[13px] font-semibold text-(--text-primary)">{{ provider.name }}</div>
                <div class="text-[11px] text-(--text-secondary) mt-0.5">{{ provider.description }}</div>
              </div>
              <UButton
                v-if="isConnected(provider.id)"
                color="success"
                variant="soft"
                size="sm"
                icon="i-lucide-check"
                @click="toggleConnect(provider.id, provider.name)"
              >
                Connected
              </UButton>
              <UButton
                v-else
                color="neutral"
                variant="outline"
                size="sm"
                @click="toggleConnect(provider.id, provider.name)"
              >
                {{ provider.id === 'bank' ? 'Add details' : 'Connect' }}
              </UButton>
            </div>
          </div>
        </section>

        <section aria-labelledby="tools-group">
          <div class="flex items-center gap-2.5 mb-3 flex-wrap">
            <span class="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-(--bg-subtle)">
              <UIcon name="i-lucide-link" class="size-3 text-(--text-secondary)" />
            </span>
            <h3 id="tools-group" class="text-[13.5px] font-semibold text-(--text-primary)">Calendar &amp; sessions</h3>
            <span class="text-[11px] text-(--text-muted)">optional</span>
          </div>

          <div class="space-y-2">
            <div
              v-for="tool in TOOL_INTEGRATIONS"
              :key="tool.id"
              class="flex items-center gap-3.5 rounded-[10px] border-[1.5px] px-4 py-3 transition-colors"
              :class="isConnected(tool.id)
                ? 'border-(--green-brand) bg-(--green-pale)'
                : 'border-(--border)'"
            >
              <div
                class="h-10 w-10 rounded-md flex items-center justify-center shrink-0 text-white font-bold text-[14px]"
                :style="{ background: tool.bg }"
              >
                {{ tool.initials }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[13px] font-semibold text-(--text-primary)">{{ tool.name }}</div>
                <div class="text-[11px] text-(--text-secondary) mt-0.5">{{ tool.description }}</div>
              </div>
              <UButton
                v-if="isConnected(tool.id)"
                color="success"
                variant="soft"
                size="sm"
                icon="i-lucide-check"
                @click="toggleConnect(tool.id, tool.name)"
              >
                Connected
              </UButton>
              <UButton
                v-else
                color="neutral"
                variant="outline"
                size="sm"
                @click="toggleConnect(tool.id, tool.name)"
              >
                Connect
              </UButton>
            </div>
          </div>
        </section>

        <UAlert
          color="warning"
          variant="soft"
          icon="i-lucide-info"
          title="Everything here is optional."
          description="Nothing breaks if you skip — you can connect or change providers anytime from Settings → Integrations."
        />
      </div>
    </div>
  </div>
</template>
