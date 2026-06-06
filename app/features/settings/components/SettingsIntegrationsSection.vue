<script setup lang="ts">
import { format, parseISO } from 'date-fns'
import SettingsSection from './SettingsSection.vue'
import { useIntegrationsApi } from '~/composables/useIntegrationsApi'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const integrationsApi = useIntegrationsApi()

interface ConnectedIntegration {
  provider: string
  account_email: string
  scopes?: string[]
  connected_at?: string
  last_used_at?: string
}

const STATIC_CARDS = [
  {
    id: 'gcal',
    provider: 'google_calendar',
    name: 'Google Calendar',
    initials: 'G',
    bg: '#4285F4',
    description: 'Sync sessions to your calendar; auto-create Meet links',
    available: true,
  },
  {
    id: 'zoom',
    provider: 'zoom',
    name: 'Zoom',
    initials: 'Z',
    bg: '#2D8CFF',
    description: 'Auto-generate meeting links for virtual sessions',
    available: false,
  },
  {
    id: 'whatsapp',
    provider: 'whatsapp',
    name: 'WhatsApp Business',
    initials: 'W',
    bg: '#25D366',
    description: 'Sync check-in nudges + invoice links to client WhatsApp',
    available: false,
  },
] as const

const connected = ref<Record<string, ConnectedIntegration>>({})
const pending = reactive<Record<string, boolean>>({})
const loading = ref(true)

async function refresh() {
  loading.value = true
  try {
    const res = await integrationsApi.list()
    const map: Record<string, ConnectedIntegration> = {}
    for (const integration of res.integrations ?? []) {
      if (integration.provider) map[integration.provider] = integration as ConnectedIntegration
    }
    connected.value = map
  } catch {
    toast.add({ title: 'Could not load integrations', color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refresh()
  // Backend redirects to /settings?connected=google_calendar on
  // successful OAuth. Flash the toast then scrub the query string so a
  // refresh doesn't re-fire it.
  const connectedParam = route.query.connected as string | undefined
  if (connectedParam) {
    const card = STATIC_CARDS.find(c => c.provider === connectedParam)
    if (card) toast.add({ title: `${card.name} connected`, color: 'success' })
    router.replace({ query: { ...route.query, connected: undefined } })
  }
  const errorParam = route.query.error as string | undefined
  if (errorParam) {
    toast.add({ title: 'Could not complete the connection', description: errorParam, color: 'error' })
    router.replace({ query: { ...route.query, error: undefined } })
  }
})

function statusLabel(card: typeof STATIC_CARDS[number]): string {
  const row = connected.value[card.provider]
  if (!row) return ''
  return `Connected as ${row.account_email}`
}

function lastUsedLabel(card: typeof STATIC_CARDS[number]): string | null {
  const row = connected.value[card.provider]
  if (!row?.last_used_at) return null
  try {
    return `Last synced ${format(parseISO(row.last_used_at), 'MMM d, h:mm a')}`
  } catch {
    return null
  }
}

async function onConnect(card: typeof STATIC_CARDS[number]) {
  if (!card.available) {
    toast.add({ title: `We'll notify you when ${card.name} is ready`, color: 'info' })
    return
  }
  if (card.provider !== 'google_calendar') {
    // Other "available" cards will wire up per-provider as their
    // backend support lands. For now, only google_calendar has a real
    // OAuth path.
    toast.add({ title: `${card.name} backend wiring is pending`, color: 'info' })
    return
  }
  pending[card.provider] = true
  try {
    const res = await integrationsApi.startGoogle()
    if (res?.authorize_url) {
      window.location.href = res.authorize_url
      return
    }
    toast.add({ title: 'Google Calendar is not configured on this deployment', color: 'warning' })
  } catch {
    toast.add({ title: 'Could not start Google sign-in', color: 'error' })
  } finally {
    pending[card.provider] = false
  }
}

async function onDisconnect(card: typeof STATIC_CARDS[number]) {
  if (card.provider !== 'google_calendar') return
  pending[card.provider] = true
  try {
    await integrationsApi.disconnectGoogle()
    toast.add({ title: `${card.name} disconnected`, color: 'neutral' })
    await refresh()
  } catch {
    toast.add({ title: 'Could not disconnect — try again', color: 'error' })
  } finally {
    pending[card.provider] = false
  }
}
</script>

<template>
  <SettingsSection
    id="integrations"
    title="Integrations"
    description="Connect tools you already use."
  >
    <div
      v-for="card in STATIC_CARDS"
      :key="card.id"
      class="rounded-md border border-(--border) bg-(--bg-surface) p-3 flex items-center gap-3"
      :class="card.available || connected[card.provider] ? '' : 'opacity-70'"
    >
      <div
        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-white font-bold text-[10px] shrink-0"
        :style="{ background: card.bg }"
      >
        {{ card.initials }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-[12.5px] font-semibold text-(--text-primary) flex items-center gap-2 flex-wrap">
          {{ card.name }}
          <UBadge
            v-if="connected[card.provider]"
            label="Connected"
            color="success"
            variant="subtle"
            size="sm"
          />
          <UBadge
            v-else-if="!card.available"
            label="Soon"
            color="neutral"
            variant="subtle"
            size="sm"
          />
        </div>
        <div v-if="connected[card.provider]" class="text-[10.5px] text-(--text-secondary) mt-0.5">
          {{ statusLabel(card) }}
          <template v-if="lastUsedLabel(card)"> · {{ lastUsedLabel(card) }}</template>
        </div>
        <div v-else class="text-[10.5px] text-(--text-muted) mt-0.5">{{ card.description }}</div>
      </div>
      <UButton
        v-if="connected[card.provider]"
        color="neutral"
        variant="outline"
        size="sm"
        :loading="pending[card.provider]"
        @click="onDisconnect(card)"
      >
        Disconnect
      </UButton>
      <UButton
        v-else
        color="neutral"
        variant="outline"
        size="sm"
        :loading="pending[card.provider]"
        :disabled="loading"
        @click="onConnect(card)"
      >
        {{ card.available ? 'Connect' : 'Notify me' }}
      </UButton>
    </div>
  </SettingsSection>
</template>
