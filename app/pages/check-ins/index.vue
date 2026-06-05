<script setup lang="ts">
import AppTopbar from '~/components/AppTopbar.vue'
import CheckInListGroup from '~/features/check-ins/components/CheckInListGroup.vue'
import CheckInListUnreadRow from '~/features/check-ins/components/CheckInListUnreadRow.vue'
import CheckInListReadRow from '~/features/check-ins/components/CheckInListReadRow.vue'
import CustomizeFormModal from '~/features/check-ins/components/CustomizeFormModal.vue'
import SendReminderModal from '~/features/check-ins/components/SendReminderModal.vue'
import type { ModelsClient } from '~/services'
import { useCheckInsApi } from '~/features/check-ins/composables/useCheckInsApi'
import { useClientsApi } from '~/features/clients/composables/useClientsApi'
import { hashVariant, clientInitials, clientName } from '~/utils/client'
import { fmtRelative, fmtWeekOf, currentWeekStart } from '~/utils/format'
import {
  groupByStatus,
  metricChipsFor,
  rowMetaLabel,
} from '~/features/check-ins/utils/groups'

definePageMeta({ layout: 'app' })

useSeoMeta({ title: 'Check-ins | FitCoach CRM' })

type Filter = 'needs-response' | 'all' | 'week'
const FILTER_TABS = [
  { id: 'needs-response', label: 'Needs response' },
  { id: 'all',            label: 'All' },
  { id: 'week',           label: 'This week' },
] as const

const route = useRoute()
const router = useRouter()
const toast = useToast()

const checkInsApi = useCheckInsApi()
const clientsApi = useClientsApi()

const customizeOpen = ref(false)
const reminderOpen = ref(false)

const activeFilter = computed<Filter>({
  get: () => {
    const f = route.query.filter as Filter
    return (['needs-response', 'all', 'week'] as const).includes(f) ? f : 'needs-response'
  },
  set: (val) => router.replace({ query: { ...route.query, filter: val } }),
})

const weekStart = currentWeekStart()

const { data, pending, error } = await useAsyncData('checkins-list', () =>
  Promise.all([
    checkInsApi.list({ per_page: 100 }),
    clientsApi.list({ per_page: 200 }),
  ]),
)

const checkIns = computed(() => data.value?.[0]?.check_ins ?? [])
const clients  = computed(() => data.value?.[1]?.clients ?? [])

const clientMap = computed(() => {
  const map = new Map<string, ModelsClient>()
  for (const client of clients.value) if (client.id) map.set(client.id, client)
  return map
})

const groups = computed(() => groupByStatus(checkIns.value))

const filteredGroups = computed(() => {
  if (activeFilter.value === 'week') {
    return {
      needsResponse: groups.value.needsResponse.filter(ci => ci.week_start_date === weekStart),
      responded: groups.value.responded.filter(ci => ci.week_start_date === weekStart),
    }
  }
  if (activeFilter.value === 'needs-response') {
    return { needsResponse: groups.value.needsResponse, responded: [] }
  }
  return groups.value
})

const counts = computed(() => ({
  'needs-response': groups.value.needsResponse.length,
  'all': checkIns.value.length,
  'week': checkIns.value.filter(ci => ci.week_start_date === weekStart).length,
}))

const subtitle = computed(() => {
  const nResp = groups.value.needsResponse.length
  const responded = groups.value.responded.length
  return `Week of ${fmtWeekOf(weekStart)} · ${nResp} need response · ${responded} responded`
})

const remindClients = computed(() => {
  const seen = new Set<string>()
  const out: Array<{ id: string, name: string, initials: string, variant: ReturnType<typeof hashVariant>, lastCheckIn?: string }> = []
  for (const ci of groups.value.needsResponse) {
    const client = ci.client_id ? clientMap.value.get(ci.client_id) : undefined
    if (!client?.id || seen.has(client.id)) continue
    seen.add(client.id)
    out.push({
      id:        client.id,
      name:      clientName(client),
      initials:  clientInitials(client),
      variant:   hashVariant(client.id),
      lastCheckIn: ci.submitted_at ? `Submitted ${fmtRelative(ci.submitted_at)}` : 'No check-in this week',
    })
  }
  return out
})

function getClient(checkIn: { client_id?: string }) {
  return checkIn.client_id ? clientMap.value.get(checkIn.client_id) : undefined
}

async function onMarkRead(id: string) {
  try {
    await checkInsApi.markRead(id)
    refreshNuxtData('checkins-list')
  } catch {
    toast.add({ title: 'Could not mark as read', color: 'error' })
  }
}

function onRespond(id: string) {
  router.push(`/check-ins/${id}`)
}

function onReminderSent() {
  reminderOpen.value = false
  toast.add({ title: 'Reminders sent!', color: 'success' })
}
</script>

<template>
  <AppTopbar title="Check-ins" :subtitle="subtitle">
    <template #actions>
      <UButton color="neutral" variant="outline" size="sm" @click="customizeOpen = true">
        Customize form
      </UButton>
      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        :disabled="remindClients.length === 0"
        @click="reminderOpen = true"
      >
        Send reminder
      </UButton>
    </template>
  </AppTopbar>

  <div class="px-8 py-3 border-b border-(--border) bg-(--bg-surface) flex items-center gap-1 max-md:px-5">
    <button
      v-for="tab in FILTER_TABS"
      :key="tab.id"
      type="button"
      class="rounded-md px-2.5 py-1 text-[12px] font-medium inline-flex items-center gap-1"
      :class="activeFilter === tab.id
        ? 'bg-(--bg-subtle) text-(--text-primary)'
        : 'text-(--text-secondary) hover:bg-(--bg-subtle)'"
      @click="activeFilter = tab.id"
    >
      {{ tab.label }}
      <span
        v-if="counts[tab.id]"
        class="ml-0.5 inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums"
        :class="tab.id === 'needs-response' && counts[tab.id]
          ? 'bg-(--green-brand) text-white'
          : 'text-(--text-muted)'"
      >{{ counts[tab.id] }}</span>
    </button>
  </div>

  <main id="main-content" class="flex-1 px-8 py-6 space-y-5 max-md:px-5">
    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Failed to load check-ins"
      :description="error.message"
    />

    <template v-if="pending">
      <USkeleton v-for="n in 2" :key="n" class="h-[200px] rounded-[10px]" />
    </template>

    <template v-else>
      <CheckInListGroup
        v-if="filteredGroups.needsResponse.length > 0 || activeFilter === 'needs-response'"
        label="Needs response"
        :count="filteredGroups.needsResponse.length"
        description="Oldest first · tap to respond"
        tone="attention"
      >
        <CheckInListUnreadRow
          v-for="ci in filteredGroups.needsResponse"
          :key="ci.id"
          :id="ci.id!"
          :initials="clientInitials(getClient(ci))"
          :variant="hashVariant(ci.client_id ?? ci.id ?? '')"
          :name="clientName(getClient(ci))"
          :week-label="rowMetaLabel(ci, getClient(ci))"
          :relative-label="ci.submitted_at ? fmtRelative(ci.submitted_at) : ''"
          :preview="ci.notes ? `\&quot;${ci.notes}\&quot;` : null"
          :unread="!ci.is_read"
          :chips="metricChipsFor(ci)"
          @mark-read="onMarkRead"
          @respond="onRespond"
        />
      </CheckInListGroup>

      <CheckInListGroup
        v-if="activeFilter !== 'needs-response' && filteredGroups.responded.length > 0"
        label="Responded"
        :count="filteredGroups.responded.length"
        description="Reference history · click to revisit"
        tone="muted"
      >
        <CheckInListReadRow
          v-for="ci in filteredGroups.responded"
          :key="ci.id"
          :id="ci.id!"
          :initials="clientInitials(getClient(ci))"
          :variant="hashVariant(ci.client_id ?? ci.id ?? '')"
          :name="clientName(getClient(ci))"
          :week-label="rowMetaLabel(ci, getClient(ci))"
          :relative-label="ci.responded_at ? fmtRelative(ci.responded_at) : (ci.submitted_at ? fmtRelative(ci.submitted_at) : '')"
          :preview="ci.notes ? `\&quot;${ci.notes}\&quot;` : null"
          :reply-preview="ci.coach_response ? `\&quot;${ci.coach_response}\&quot;` : null"
        />
      </CheckInListGroup>
    </template>
  </main>

  <CustomizeFormModal
    v-model:open="customizeOpen"
    @saved="toast.add({ title: 'Form saved!', color: 'success' })"
  />

  <SendReminderModal
    v-model:open="reminderOpen"
    :clients="remindClients"
    @sent="onReminderSent"
  />
</template>
