<script setup lang="ts">
import { computed, ref } from 'vue'
import AppTopbar from '~/components/AppTopbar.vue'
import SearchInput from '~/components/SearchInput.vue'
import ClientFilterChips from '~/features/clients/components/ClientFilterChips.vue'
import ClientFilterPanel from '~/features/clients/components/ClientFilterPanel.vue'
import ClientSortDropdown from '~/features/clients/components/ClientSortDropdown.vue'
import ClientsTable from '~/features/clients/components/ClientsTable.vue'
import ClientFormModal from '~/features/clients/components/ClientFormModal.vue'
import type { FilterChip } from '~/features/clients/components/ClientFilterChips.vue'
import type { Client } from '~/features/clients/components/ClientRow.vue'
import type { ActionItem } from '~/features/clients/components/ClientActionsMenu.vue'
import type { ModelsClient } from '~/services'
import { useClientsApi } from '~/features/clients/composables/useClientsApi'
import { useClientsFilters } from '~/features/clients/composables/useClientsFilters'
import { toClientRow } from '~/features/clients/utils/transform'

definePageMeta({ layout: 'app' })

useSeoMeta({ title: 'Clients | FitCoach CRM' })

const clientsApi = useClientsApi()
const router = useRouter()
const toast = useToast()

// ── Filter / search / pagination / sort state (URL-synced) ────────────────

const { search, activeChip, page, sort, filters, filterActive, listParams } = useClientsFilters()

// ── Initial counts (parallel per-status totals) ───────────

const { data: countsData } = await useAsyncData('clients-counts', () =>
  Promise.all([
    clientsApi.list({ per_page: 1 }),
    clientsApi.list({ status: 'active', per_page: 1 }),
    clientsApi.list({ status: 'paused', per_page: 1 }),
    clientsApi.list({ status: 'new', per_page: 1 }),
  ]),
)

const chips = computed<FilterChip[]>(() => [
  { id: 'all',    label: 'All',          count: countsData.value?.[0]?.total ?? 0 },
  { id: 'active', label: 'Active',       count: countsData.value?.[1]?.total ?? 0 },
  { id: 'paused', label: 'Paused',       count: countsData.value?.[2]?.total ?? 0 },
  { id: 'new',    label: 'New Trial',    count: countsData.value?.[3]?.total ?? 0 },
])

const subtitle = computed(() => {
  const active = countsData.value?.[1]?.total ?? 0
  const paused = countsData.value?.[2]?.total ?? 0
  const trial  = countsData.value?.[3]?.total ?? 0
  return `${active} active · ${paused} paused · ${trial} trial`
})

// ── Reactive client list ───────────────────────────────────

const { data: listData, pending } = await useAsyncData(
  'clients-list',
  () => clientsApi.list(listParams.value),
  { watch: [listParams] },
)

const rawClients  = computed(() => listData.value?.clients ?? [])
const totalPages  = computed(() => listData.value?.total_pages ?? 1)
const total       = computed(() => listData.value?.total ?? 0)
const fromItem    = computed(() => total.value === 0 ? 0 : (page.value - 1) * 20 + 1)
const toItem      = computed(() => Math.min(page.value * 20, total.value))

// ── Build client cards with action handlers ────────────────

function buildMenuActions(c: ModelsClient): ActionItem[] {
  const id = c.id!
  const status = c.status ?? 'active'

  const viewAction: ActionItem = {
    label: 'View Profile',
    onClick: () => router.push(`/clients/${id}`),
  }
  const removeAction: ActionItem = {
    label: 'Remove',
    danger: true,
    onClick: () => handleRemove(c),
  }

  if (status === 'active') {
    return [
      viewAction,
      { label: 'Send Message', onClick: () => toast.add({ title: 'Messaging coming soon', color: 'neutral' }) },
      { divider: true },
      { label: 'Pause Client', onClick: () => handleStatusChange(id, 'paused') },
      removeAction,
    ]
  }
  if (status === 'new') {
    return [
      viewAction,
      { divider: true },
      { label: 'Convert to Active', onClick: () => handleStatusChange(id, 'active') },
      removeAction,
    ]
  }
  if (status === 'paused') {
    return [
      viewAction,
      { divider: true },
      { label: 'Reactivate', onClick: () => handleStatusChange(id, 'active') },
      removeAction,
    ]
  }
  if (status === 'ended') {
    return [viewAction, { divider: true }, removeAction]
  }
  return [viewAction, removeAction]
}

const cards = computed<Client[]>(() =>
  rawClients.value.map(c => ({
    ...toClientRow(c),
    menuActions: buildMenuActions(c),
  })),
)

// ACTIONS
async function handleStatusChange(id: string, status: 'active' | 'paused' | 'new' | 'ended') {
  try {
    await clientsApi.update(id, { status })
    toast.add({ title: 'Client status updated', color: 'success' })
    refreshNuxtData(['clients-list', 'clients-counts'])
  } catch {
    toast.add({ title: 'Failed to update status', color: 'error' })
  }
}

const removing = ref<string | null>(null)

async function handleRemove(c: ModelsClient) {
  if (!confirm(`Remove ${clientName(c)}? This cannot be undone.`)) return
  removing.value = c.id ?? null
  try {
    await clientsApi.remove(c.id!)
    toast.add({ title: 'Client removed', color: 'success' })
    refreshNuxtData(['clients-list', 'clients-counts'])
  } catch {
    toast.add({ title: 'Failed to remove client', color: 'error' })
  } finally {
    removing.value = null
  }
}

// ── Add client modal ───────────────────────────────────────

const showAddModal = ref(false)

function onClientSaved() {
  showAddModal.value = false
  refreshNuxtData(['clients-list', 'clients-counts'])
}
</script>

<template>
  <AppTopbar title="Clients" :subtitle="subtitle">
    <template #actions>
      <SearchInput v-model="search" placeholder="Search clients…" />
      <ClientFilterPanel v-model="filters" />
      <ClientSortDropdown v-model="sort" />
      <button
        type="button"
        class="h-10 px-4 rounded-lg bg-primary hover:bg-(--green-hover) text-white text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 whitespace-nowrap transition-colors"
        @click="showAddModal = true"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M6.5 1v11M1 6.5h11" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Add Client
      </button>
    </template>
  </AppTopbar>

  <div class="py-7 px-8 flex-1">
    <ClientFilterChips v-model="activeChip" :chips="chips" />
    <ClientsTable
      :clients="cards"
      :page="page"
      :total-pages="totalPages"
      :from="fromItem"
      :to="toItem"
      :total="total"
      :sort="sort"
      :loading="pending"
      :filter-active="filterActive"
      @update:page="page = $event"
      @update:sort="sort = $event"
      @add-client="showAddModal = true"
    />
  </div>

  <ClientFormModal
    :open="showAddModal"
    @update:open="showAddModal = $event"
    @saved="onClientSaved"
  />
</template>
