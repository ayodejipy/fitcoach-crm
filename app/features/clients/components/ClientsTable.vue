<template>
  <div class="bg-(--bg-surface) border border-(--border) rounded-[14px] overflow-hidden">
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-[#F7FAF8] dark:bg-white/[.03] border-b-[1.5px] border-(--border)">
          <th class="text-left text-[11px] font-bold uppercase tracking-[0.7px] text-(--text-muted) py-[13px] pl-[22px] pr-4 whitespace-nowrap w-[220px]">
            <button
              type="button"
              class="th-sort inline-flex items-center gap-1 cursor-pointer bg-transparent border-none text-inherit font-inherit text-inherit uppercase tracking-inherit"
              :class="{ 'th-sort-active': sort.column === 'name' }"
              @click="toggleSort('name')"
            >
              Client
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" :class="sort.column === 'name' ? 'opacity-100' : 'opacity-40'">
                <path :d="sortArrowPath('name')" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </th>
          <th class="text-left text-[11px] font-bold uppercase tracking-[0.7px] text-(--text-muted) py-[13px] px-4 whitespace-nowrap">Goal</th>
          <th class="text-left text-[11px] font-bold uppercase tracking-[0.7px] text-(--text-muted) py-[13px] px-4 whitespace-nowrap">Plan</th>
          <th class="text-left text-[11px] font-bold uppercase tracking-[0.7px] text-(--text-muted) py-[13px] px-4 whitespace-nowrap">
            <button
              type="button"
              class="th-sort inline-flex items-center gap-1 cursor-pointer bg-transparent border-none text-inherit font-inherit text-inherit uppercase tracking-inherit"
              :class="{ 'th-sort-active': sort.column === 'startDate' }"
              @click="toggleSort('startDate')"
            >
              Start Date
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" :class="sort.column === 'startDate' ? 'opacity-100' : 'opacity-40'">
                <path :d="sortArrowPath('startDate')" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </th>
          <th class="text-left text-[11px] font-bold uppercase tracking-[0.7px] text-(--text-muted) py-[13px] px-4 whitespace-nowrap">
            <button
              type="button"
              class="th-sort inline-flex items-center gap-1 cursor-pointer bg-transparent border-none font-inherit text-inherit uppercase tracking-inherit"
              :class="sort.column === 'lastCheckIn' ? 'th-sort-active' : ''"
              @click="toggleSort('lastCheckIn')"
            >
              Last Check-in
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path :d="sortArrowPath('lastCheckIn')" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </th>
          <th class="text-left text-[11px] font-bold uppercase tracking-[0.7px] text-(--text-muted) py-[13px] px-4 whitespace-nowrap">Sessions</th>
          <th class="text-left text-[11px] font-bold uppercase tracking-[0.7px] text-(--text-muted) py-[13px] px-4 whitespace-nowrap">Status</th>
          <th class="text-center text-[11px] font-bold uppercase tracking-[0.7px] text-(--text-muted) py-[13px] pl-4 pr-[22px] whitespace-nowrap w-[60px]">Actions</th>
        </tr>
      </thead>
      <tbody>
        <ClientRow v-for="c in clients" :key="c.id" :client="c" />
      </tbody>
    </table>

    <Pagination
      :model-value="page"
      :pages="totalPages"
      :from="from"
      :to="to"
      :total="total"
      items-label="clients"
      @update:model-value="$emit('update:page', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ClientRow, { type Client } from './ClientRow.vue'
import Pagination from '~/components/Pagination.vue'

type SortCol = 'name' | 'startDate' | 'lastCheckIn'

const props = defineProps<{
  clients: Client[]
  page: number
  totalPages: number
  from: number
  to: number
  total: number
  sort: { column: SortCol; direction: 'asc' | 'desc' }
}>()

const emit = defineEmits<{
  'update:page': [page: number]
  'update:sort': [sort: { column: SortCol; direction: 'asc' | 'desc' }]
}>()

const toggleSort = (col: SortCol) => {
  if (props.sort.column === col) {
    emit('update:sort', { column: col, direction: props.sort.direction === 'asc' ? 'desc' : 'asc' })
  } else {
    emit('update:sort', { column: col, direction: 'asc' })
  }
}

const sortArrowPath = (col: SortCol) => {
  if (props.sort.column !== col) return 'M5 2v6M2 5l3-3 3 3'
  return props.sort.direction === 'asc' ? 'M5 2v6M2 5l3-3 3 3' : 'M5 2v6M7 7l-2 2-2-2'
}
</script>

<style scoped>
.th-sort:hover { color: var(--green-brand); }
.th-sort-active { color: var(--green-brand); }
</style>
