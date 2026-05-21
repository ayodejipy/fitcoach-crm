<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppTopbar from '~/components/AppTopbar.vue'
import SearchInput from '~/components/SearchInput.vue'
import ClientFilterChips from '~/features/clients/components/ClientFilterChips.vue'
import ClientsTable from '~/features/clients/components/ClientsTable.vue'
import ClientFormModal from '~/features/clients/components/ClientFormModal.vue'
import type { FilterChip } from '~/features/clients/components/ClientFilterChips.vue'
import type { Client } from '~/features/clients/components/ClientRow.vue'
import type { ActionItem } from '~/features/clients/components/ClientActionsMenu.vue'
import type { ModelsClient } from '~/services'
import { useClientsApi } from '~/features/clients/composables/useClientsApi'
import { toClientRow } from '~/features/clients/utils/transform'

definePageMeta({ layout: 'app' })

useSeoMeta({ title: 'Clients | FitCoach CRM' })

const clientsApi = useClientsApi()
const router = useRouter()
const toast = useToast()

// TODO: Move this into a composable

// ── Filter / search / pagination state ────────────────────

type StatusFilter = 'all' | 'active' | 'paused' | 'new' | 'ended'

const search = ref('')
const activeChip = ref<StatusFilter>('all')
const page = ref(1)
const sort = ref<{ column: 'name' | 'startDate' | 'lastCheckIn'; direction: 'asc' | 'desc' }>({
  column: 'lastCheckIn',
  direction: 'desc',
})

const debouncedSearch = refDebounced(search, 300)

// Reset page when filter or search changes
watch([activeChip, debouncedSearch], () => { page.value = 1 })

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

const listParams = computed(() => ({
  status:   activeChip.value === 'all' ? undefined : activeChip.value,
  search:   debouncedSearch.value || undefined,
  page:     page.value,
  per_page: 20,
}))

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
      <button type="button" class="btn-outline">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        Filter
      </button>
      <button type="button" class="btn-outline">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 4l3-3 3 3M5 1v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 10l3 3 3-3M12 3v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Sort
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" class="ml-0.5 opacity-50">
          <path d="M2 4l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
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
      :filter-active="activeChip !== 'all' || !!debouncedSearch"
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

<style scoped>
.btn-outline {
  border: 1.5px solid #D1E0D5;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #3D5A45;
  background: var(--bg-surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: border-color .15s, background .15s;
}
.btn-outline:hover {
  border-color: var(--green-brand);
  background: #F0F9F4;
}
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .btn-outline { border-color: var(--border); color: var(--text-secondary); }
.dark .btn-outline:hover { background: var(--bg-primary-soft); }
</style>
