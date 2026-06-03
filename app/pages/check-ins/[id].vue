<script setup lang="ts">
import AppTopbar from '~/components/AppTopbar.vue'
import CheckInThreadCurrent from '~/features/check-ins/components/CheckInThreadCurrent.vue'
import CheckInThreadHistory from '~/features/check-ins/components/CheckInThreadHistory.vue'
import { useCheckInsApi } from '~/features/check-ins/composables/useCheckInsApi'
import { useClientsApi } from '~/features/clients/composables/useClientsApi'
import { clientName } from '~/utils/client'
import { weekNumberFor } from '~/features/check-ins/utils/groups'
import type { ModelsCoachCheckIn } from '~/services'

definePageMeta({ layout: 'app' })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const checkInsApi = useCheckInsApi()
const clientsApi = useClientsApi()

const id = computed(() => route.params.id as string)
const sending = ref(false)

const { data, pending, error } = await useAsyncData(
  () => `checkin-thread-${id.value}`,
  async () => {
    const current = await checkInsApi.get(id.value)
    if (!current?.client_id) return { current, client: undefined, history: [] }
    const [client, list] = await Promise.all([
      clientsApi.get(current.client_id),
      checkInsApi.list({ client_id: current.client_id, per_page: 30 }),
    ])
    const history = (list?.check_ins ?? []).filter(ci => ci.id !== current.id)
    history.sort((a, b) => (b.submitted_at ?? '').localeCompare(a.submitted_at ?? ''))
    return { current, client, history }
  },
  { watch: [id] },
)

const current = computed<ModelsCoachCheckIn | undefined>(() => data.value?.current)
const client = computed(() => data.value?.client)
const history = computed(() => data.value?.history ?? [])

const displayName = computed(() => client.value ? clientName(client.value) : 'Client')

const currentWeekNumber = computed(() =>
  current.value ? weekNumberFor(current.value, client.value) : 1,
)

const unreadInThread = computed(() =>
  history.value.filter(ci => !ci.coach_response).length + (current.value && !current.value.coach_response ? 1 : 0),
)

const totalUnread = computed(() => unreadInThread.value)

useSeoMeta({
  title: () => client.value
    ? `${clientName(client.value)} · Wk ${currentWeekNumber.value} | Check-ins`
    : 'Check-in | FitCoach CRM',
})

async function onSend(text: string) {
  if (!current.value?.id) return
  sending.value = true
  try {
    await checkInsApi.respond(current.value.id, { response: text })
    toast.add({ title: 'Response sent', color: 'success' })
    router.push('/check-ins')
  } catch {
    toast.add({ title: 'Could not send response', color: 'error' })
  } finally {
    sending.value = false
  }
}

async function onSaveDraft(text: string) {
  if (!current.value?.id) return
  try {
    await checkInsApi.saveDraft(current.value.id, { draft: text })
    toast.add({ title: 'Draft saved', color: 'success' })
  } catch {
    toast.add({ title: 'Could not save draft', color: 'error' })
  }
}

async function onMarkRead() {
  if (!current.value?.id) return
  try {
    await checkInsApi.markRead(current.value.id)
    refreshNuxtData(`checkin-thread-${id.value}`)
  } catch {
    toast.add({ title: 'Could not mark as read', color: 'error' })
  }
}

function backToInbox() {
  router.push('/check-ins')
}
</script>

<template>
  <AppTopbar>
    <template #title>
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-[12.5px] min-w-0">
        <NuxtLink to="/check-ins" class="text-(--text-muted) hover:text-(--text-primary) no-underline">Check-ins</NuxtLink>
        <span aria-hidden="true" class="text-(--text-muted)">/</span>
        <NuxtLink
          v-if="client?.id"
          :to="`/clients/${client.id}`"
          class="text-(--text-muted) hover:text-(--text-primary) no-underline truncate"
        >
          {{ displayName }}
        </NuxtLink>
        <span aria-hidden="true" class="text-(--text-muted)">/</span>
        <span class="font-semibold text-(--text-primary)">Wk {{ currentWeekNumber }}</span>
      </nav>
      <UBadge
        v-if="current && !current.coach_response"
        label="Needs response"
        color="success"
        variant="soft"
        size="sm"
        class="ml-2"
      />
    </template>
    <template #actions>
      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        icon="i-lucide-inbox"
        aria-label="Back to inbox"
        @click="backToInbox"
      />
      <UButton
        v-if="current && !current.is_read"
        color="neutral"
        variant="outline"
        size="sm"
        @click="onMarkRead"
      >
        Mark read
      </UButton>
    </template>
  </AppTopbar>

  <main id="main-content" class="flex-1 px-8 py-7 max-md:px-5">
    <USkeleton v-if="pending" class="h-[400px] rounded-[10px]" />

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Failed to load check-in"
      :description="error.message"
    />

    <div v-else-if="current" class="max-w-[820px] mx-auto w-full">
      <div class="flex items-center gap-3 mb-6">
        <NuxtLink
          v-if="client?.id"
          :to="`/clients/${client.id}`"
          class="inline-flex h-12 w-12 items-center justify-center rounded-full text-[14px] font-semibold text-white no-underline shrink-0"
          :style="{ background: '#C2410C' }"
          aria-hidden="true"
        >
          {{ displayName.split(' ').map(part => part[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() }}
        </NuxtLink>
        <div class="flex-1 min-w-0">
          <NuxtLink
            v-if="client?.id"
            :to="`/clients/${client.id}`"
            class="text-[15px] font-semibold text-(--text-primary) hover:underline no-underline"
          >
            {{ displayName }}
          </NuxtLink>
          <div class="text-[12px] text-(--text-muted) tabular-nums">
            <span v-if="client?.goal">{{ client.goal }} · </span>
            Wk {{ currentWeekNumber }} of {{ client?.program_total ?? 12 }}
          </div>
        </div>
        <UButton
          v-if="client?.id"
          color="neutral"
          variant="outline"
          size="sm"
          :to="`/clients/${client.id}`"
        >
          Open profile
        </UButton>
      </div>

      <CheckInThreadCurrent
        :check-in="current"
        :week-number="currentWeekNumber"
        :client-name="displayName"
        :sending="sending"
        @send="onSend"
        @save-draft="onSaveDraft"
      />

      <template v-if="history.length > 0">
        <div class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted) mb-3 mt-8">
          Earlier from this client
        </div>
        <div class="space-y-2">
          <CheckInThreadHistory
            v-for="entry in history"
            :key="entry.id"
            :check-in="entry"
            :week-number="weekNumberFor(entry, client)"
          />
        </div>
      </template>

      <div class="mt-8 flex items-center justify-center gap-4 text-[11px] text-(--text-muted) flex-wrap">
        <span class="inline-flex items-center gap-1.5">
          <kbd class="rounded border border-(--border) bg-(--bg-surface) px-1 font-mono text-[10px]">⌘+Enter</kbd>
          Send
        </span>
        <span class="inline-flex items-center gap-1.5">
          <kbd class="rounded border border-(--border) bg-(--bg-surface) px-1 font-mono text-[10px]">E</kbd>
          Mark read
        </span>
      </div>
    </div>

    <div v-else class="px-8 py-16 text-center max-md:px-5">
      <UIcon name="i-lucide-inbox" class="size-7 text-(--text-muted) mb-2 inline-block" />
      <p class="text-[13.5px] font-medium text-(--text-secondary)">Check-in not found</p>
      <p class="mt-1 text-[12px] text-(--text-muted)">It may have been removed.</p>
      <UButton color="neutral" variant="outline" size="sm" class="mt-4" @click="backToInbox">
        Back to inbox
      </UButton>
    </div>
  </main>
</template>
