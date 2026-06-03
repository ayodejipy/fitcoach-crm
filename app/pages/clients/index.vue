<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import AppTopbar from '~/components/AppTopbar.vue'
import ClientEngagementGroup from '~/features/clients/components/ClientEngagementGroup.vue'
import ClientListRow from '~/features/clients/components/ClientListRow.vue'
import ClientFormModal from '~/features/clients/components/ClientFormModal.vue'
import type { ModelsClient } from '~/services'
import { useClientsApi } from '~/features/clients/composables/useClientsApi'
import { hashVariant, clientInitials, clientName } from '~/utils/client'
import {
  ENGAGEMENT_GROUPS,
  computeEngagement,
  engagementReason,
  primaryActionLabel,
  type EngagementState,
} from '~/features/clients/utils/engagement'

definePageMeta({ layout: 'app' })

useSeoMeta({ title: 'Clients | FitCoach CRM' })

const clientsApi = useClientsApi()
const router = useRouter()
const toast = useToast()

const search = ref('')
const debouncedSearch = refDebounced(search, 300)
const showAddModal = ref(false)

const { data: listData, pending, error } = await useAsyncData(
  'clients-list',
  () => clientsApi.list({
    per_page: 100,
    ...(debouncedSearch.value ? { search: debouncedSearch.value } : {}),
  }),
  { watch: [debouncedSearch] },
)

const allClients = computed<ModelsClient[]>(() => listData.value?.clients ?? [])

const grouped = computed(() => {
  const buckets: Record<EngagementState, ModelsClient[]> = {
    'needs-attention': [],
    'active': [],
    'quiet': [],
  }
  for (const client of allClients.value) {
    buckets[computeEngagement(client)].push(client)
  }
  return buckets
})

const attentionCount = computed(() => grouped.value['needs-attention'].length)

const subtitle = computed(() => {
  const total = allClients.value.length
  if (attentionCount.value > 0) {
    return `${total} clients · ${attentionCount.value} ${attentionCount.value === 1 ? 'needs' : 'need'} attention`
  }
  return `${total} clients · all on track`
})

function menuItemsFor(client: ModelsClient) {
  const id = client.id!
  const status = client.status ?? 'active'
  const items: Array<Record<string, unknown>> = [
    { label: 'Open profile', icon: 'i-lucide-user', onSelect: () => router.push(`/clients/${id}`) },
    { label: 'Send message', icon: 'i-lucide-mail', onSelect: () => toast.add({ title: 'Messaging coming soon', color: 'neutral' }) },
    { type: 'separator' },
  ]

  if (status === 'active') {
    items.push({ label: 'Pause client', icon: 'i-lucide-pause-circle', onSelect: () => updateStatus(id, 'paused') })
  } else if (status === 'paused') {
    items.push({ label: 'Reactivate', icon: 'i-lucide-play-circle', onSelect: () => updateStatus(id, 'active') })
  } else if (status === 'new') {
    items.push({ label: 'Convert to active', icon: 'i-lucide-check', onSelect: () => updateStatus(id, 'active') })
  }

  items.push({ label: 'Remove', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => confirmRemove(client) })
  return items
}

async function updateStatus(id: string, status: 'active' | 'paused' | 'new' | 'ended') {
  try {
    await clientsApi.update(id, { status })
    toast.add({ title: 'Client status updated', color: 'success' })
    refreshNuxtData('clients-list')
  } catch {
    toast.add({ title: 'Failed to update status', color: 'error' })
  }
}

async function confirmRemove(client: ModelsClient) {
  if (!confirm(`Remove ${clientName(client)}? This cannot be undone.`)) return
  try {
    await clientsApi.remove(client.id!)
    toast.add({ title: 'Client removed', color: 'success' })
    refreshNuxtData('clients-list')
  } catch {
    toast.add({ title: 'Failed to remove client', color: 'error' })
  }
}

function onOpen(id: string) { router.push(`/clients/${id}`) }

function onPrimary(client: ModelsClient) {
  const engagement = computeEngagement(client)
  const label = primaryActionLabel(client, engagement)
  if (label === 'Open profile') return router.push(`/clients/${client.id}`)
  if (label === 'Reactivate') return updateStatus(client.id!, 'active')
  toast.add({ title: `${label} coming soon`, color: 'neutral' })
}

function onClientSaved() {
  showAddModal.value = false
  refreshNuxtData('clients-list')
}
</script>

<template>
  <AppTopbar title="Clients" :subtitle="subtitle">
    <template #actions>
      <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-download">Export</UButton>
      <UButton color="primary" size="sm" icon="i-lucide-plus" @click="showAddModal = true">Add client</UButton>
    </template>
  </AppTopbar>

  <div class="px-8 py-3 border-b border-(--border) bg-(--bg-surface) flex items-center justify-between gap-3 max-md:px-5 max-md:flex-wrap">
    <div class="inline-flex items-center gap-1.5 text-[12px] text-(--text-muted)">
      <UIcon name="i-lucide-layout-grid" class="size-3.5" />
      Grouped by engagement
    </div>
    <UInput
      v-model="search"
      placeholder="Filter clients…"
      icon="i-lucide-search"
      size="sm"
      class="w-[240px]"
    />
  </div>

  <main id="main-content" class="flex-1 px-8 py-6 space-y-5 max-md:px-5">
    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Failed to load clients"
      :description="error.message"
    />

    <template v-if="pending">
      <USkeleton v-for="n in 3" :key="n" class="h-[140px] rounded-[10px]" />
    </template>

    <template v-else>
      <ClientEngagementGroup
        v-for="meta in ENGAGEMENT_GROUPS"
        :key="meta.id"
        :label="meta.label"
        :dot-class="meta.dot"
        :description="meta.description"
        :count="grouped[meta.id].length"
        :empty-hint="meta.emptyHint"
      >
        <ClientListRow
          v-for="client in grouped[meta.id]"
          :key="client.id"
          :id="client.id!"
          :initials="clientInitials(client)"
          :variant="hashVariant(client.id ?? '')"
          :name="clientName(client)"
          :goal="client.goal"
          :is-new="(client.status ?? 'active') === 'new'"
          :reason="engagementReason(client)"
          :sessions-logged="client.sessions_count"
          :primary-action-label="primaryActionLabel(client, meta.id)"
          :menu-items="menuItemsFor(client)"
          @open="onOpen"
          @primary="onPrimary(client)"
        />
      </ClientEngagementGroup>
    </template>
  </main>

  <ClientFormModal
    :open="showAddModal"
    @update:open="showAddModal = $event"
    @saved="onClientSaved"
  />
</template>
