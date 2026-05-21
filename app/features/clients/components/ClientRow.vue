<template>
  <tr
    class="transition-colors duration-100 cursor-pointer border-b border-[#F0F4F1] dark:border-white/5 last:border-b-0 hover:bg-[#F0F9F4]! dark:hover:bg-(--bg-primary-soft)!"
    :class="[
      { 'new-row': client.isNew },
      { 'bg-[#FFFBF7]! dark:bg-[#E67E22]/10!': client.paymentOverdue },
      { 'opacity-70': client.status === 'ended' },
    ]"
  >
    <!-- Client -->
    <td class="py-3.5 pl-[22px] pr-4 align-middle">
      <div class="flex items-center gap-3">
        <Avatar :initials="client.initials" :variant="client.variant" :size="36" :muted="client.status === 'ended'" />
        <div>
          <div class="text-sm font-semibold flex items-center" :class="client.status === 'ended' ? 'text-(--text-muted)' : 'text-(--text-primary)'">
            {{ client.name }}
            <span v-if="client.isNew" class="ml-1.5 text-[10px] bg-[#EBF5FB] dark:bg-[#3498DB]/15 text-[#3498DB] rounded-[10px] px-[7px] py-px font-bold">NEW</span>
            <svg
              v-if="client.paymentOverdue"
              class="ml-1.5 inline-block"
              width="13" height="13" viewBox="0 0 13 13" fill="none"
              :aria-label="'Payment overdue'"
            >
              <path d="M6.5 1L1 11h11L6.5 1z" fill="#FEF3EA" stroke="#E67E22" stroke-width="1.2" stroke-linejoin="round"/>
              <path d="M6.5 5v3M6.5 9.5v.5" stroke="#E67E22" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="text-xs text-(--text-muted) mt-0.5">{{ client.email }}</div>
        </div>
      </div>
    </td>

    <!-- Goal -->
    <td class="py-3.5 px-4 align-middle">
      <div class="text-[13px] font-medium" :class="client.status === 'ended' ? 'text-[#95A5A6]' : 'text-[#2D4A36] dark:text-(--text-primary)'">{{ client.goal }}</div>
      <div class="text-[11px] text-[#8FAD97] dark:text-(--text-muted) mt-0.5">{{ client.goalSub }}</div>
    </td>

    <!-- Plan -->
    <td class="py-3.5 px-4 align-middle">
      <div class="text-[13px] font-medium" :class="client.status === 'ended' ? 'text-[#95A5A6]' : 'text-[#2D4A36] dark:text-(--text-primary)'">{{ client.planName }}</div>
      <div
        class="text-[11px] mt-0.5"
        :class="client.planPriceOverdue ? 'text-[#E67E22] font-semibold' : 'text-[#8FAD97] dark:text-(--text-muted)'"
      >{{ client.planPrice }}</div>
    </td>

    <!-- Start date -->
    <td class="py-3.5 px-4 align-middle">
      <span class="text-[13px]" :class="client.status === 'ended' ? 'text-[#95A5A6]' : 'text-[#3D5A45] dark:text-(--text-secondary)'">{{ client.startDate }}</span>
    </td>

    <!-- Last check-in -->
    <td class="py-3.5 px-4 align-middle">
      <div class="relative inline-block" :class="client.checkInTooltip ? 'group' : ''">
        <span class="text-[13px]" :class="checkInClass">{{ client.lastCheckIn }}</span>
        <span
          v-if="client.checkInTooltip"
          class="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 bg-(--green-deep) text-white text-[11px] font-medium py-[5px] px-2.5 rounded-md whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[50]"
        >{{ client.checkInTooltip }}</span>
      </div>
    </td>

    <!-- Sessions -->
    <td class="py-3.5 px-4 align-middle">
      <div class="flex flex-col gap-[5px] min-w-[80px]">
        <span class="text-[13px] font-semibold" :class="client.status === 'ended' ? 'text-[#95A5A6]' : 'text-[#2D4A36] dark:text-(--text-primary)'">{{ client.sessionsCount }}</span>
        <Sparkline :bars="client.sparkline" :muted="client.status === 'ended'" />
      </div>
    </td>

    <!-- Status -->
    <td class="py-3.5 px-4 align-middle">
      <ClientStatusBadge :status="client.status" :label="client.statusLabel" />
    </td>

    <!-- Actions -->
    <td class="py-3.5 pl-4 pr-[22px] align-middle text-center w-[60px]">
      <ClientActionsMenu :items="client.menuActions" />
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Avatar from '~/components/Avatar.vue'
import Sparkline from './Sparkline.vue'
import ClientStatusBadge from './ClientStatusBadge.vue'
import ClientActionsMenu, { type ActionItem } from './ClientActionsMenu.vue'

export type CheckInTone = 'ok' | 'warn' | 'late' | 'muted'

export interface Client {
  id: string
  initials: string
  variant: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
  name: string
  email: string
  goal: string
  goalSub: string
  planName: string
  planPrice: string
  planPriceOverdue?: boolean
  startDate: string
  lastCheckIn: string
  checkInTone: CheckInTone
  checkInTooltip?: string
  sessionsCount: number
  sparkline: Array<{ height: number; hi?: boolean }>
  status: 'active' | 'paused' | 'new' | 'ended'
  statusLabel?: string
  isNew?: boolean
  paymentOverdue?: boolean
  menuActions: ActionItem[]
}

const props = defineProps<{
  client: Client
}>()

const checkInClass = computed(() => ({
  ok:    'text-[#3D5A45] dark:text-(--text-secondary)',
  warn:  'text-[#E67E22] font-semibold',
  late:  'text-[#E74C3C] font-semibold',
  muted: 'text-[#BDC3C7]',
}[props.client.checkInTone]))
</script>

<style scoped>
.new-row { animation: new-row-pulse 2s ease forwards; }
@keyframes new-row-pulse {
  0%   { background: #EBF5FB; }
  100% { background: transparent; }
}
@keyframes new-row-pulse-dark {
  0%   { background: rgba(52, 152, 219, .15); }
  100% { background: transparent; }
}
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .new-row { animation: new-row-pulse-dark 2s ease forwards; }
</style>
