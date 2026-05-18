<template>
  <div class="bg-(--bg-surface) rounded-[14px] border border-(--border) overflow-hidden">
    <header class="flex items-center justify-between py-[18px] px-[22px] pb-3.5 border-b border-[#F0F4F1] dark:border-white/5">
      <span class="text-[15px] font-bold text-(--text-primary)">Client Overview</span>
      <a href="#" class="text-xs font-semibold text-primary dark:text-(--green-light) cursor-pointer no-underline">View All {{ totalClients }} Clients →</a>
    </header>
    <table class="w-full border-collapse">
      <thead>
        <tr>
          <th
            v-for="h in headers"
            :key="h"
            class="text-left text-[11px] font-bold uppercase tracking-[0.6px] text-(--text-muted) py-3 px-[22px] bg-[#F9FBF9] dark:bg-white/[.03] border-b border-(--border)"
          >{{ h }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(c, i) in clients"
          :key="c.name"
          class="transition-colors duration-100 hover:bg-[#F9FBF9] dark:hover:bg-white/[.03]"
        >
          <td class="py-3.5 px-[22px] align-middle" :class="i < clients.length - 1 ? 'border-b border-[#F5F7F5] dark:border-white/5' : ''">
            <div class="flex items-center gap-3">
              <Avatar :initials="c.initials" :variant="c.variant" :size="34" />
              <div>
                <div class="text-sm font-semibold text-(--text-primary)">{{ c.name }}</div>
                <div class="text-xs text-(--text-muted) mt-px">{{ c.email }}</div>
              </div>
            </div>
          </td>
          <td class="py-3.5 px-[22px] align-middle text-[13px] text-(--text-secondary)" :class="i < clients.length - 1 ? 'border-b border-[#F5F7F5] dark:border-white/5' : ''">{{ c.goal }}</td>
          <td class="py-3.5 px-[22px] align-middle text-[13px] text-(--text-muted)" :class="i < clients.length - 1 ? 'border-b border-[#F5F7F5] dark:border-white/5' : ''">{{ c.lastCheckIn }}</td>
          <td class="py-3.5 px-[22px] align-middle" :class="i < clients.length - 1 ? 'border-b border-[#F5F7F5] dark:border-white/5' : ''">
            <span class="text-[11px] font-bold py-1 px-3 rounded-[20px] inline-block" :class="statusClass(c.status)">{{ statusLabel(c.status) }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import Avatar from '~/components/Avatar.vue'

type ClientStatus = 'active' | 'paused' | 'new' | 'ended'

defineProps<{
  clients: Array<{
    initials: string
    variant: 'a' | 'b' | 'c' | 'd' | 'e'
    name: string
    email: string
    goal: string
    lastCheckIn: string
    status: ClientStatus
    statusLabel?: string
  }>
  totalClients: number
}>()

const headers = ['Client', 'Goal', 'Last Check-in', 'Status']

const statusClass = (s: ClientStatus) => ({
  active: 'bg-(--green-pale) text-primary dark:bg-(--bg-primary-soft) dark:text-(--green-light)',
  paused: 'bg-[#FEF3EA] text-[#E67E22] dark:bg-[#E67E22]/15',
  new:    'bg-[#EBF5FB] text-[#3498DB] dark:bg-[#3498DB]/15',
  ended:  'bg-[#F5F5F5] text-[#95A5A6] dark:bg-white/5',
}[s])

const statusLabel = (s: ClientStatus) => ({
  active: 'Active',
  paused: 'Needs attention',
  new:    'New',
  ended:  'Ended',
}[s])
</script>
