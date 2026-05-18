<template>
  <div class="relative overflow-hidden bg-(--bg-surface) border border-[#E5EDE8] dark:border-(--border) rounded-[14px] p-7 mb-1">
    <div class="absolute top-0 inset-x-0 h-1" :style="{ background: 'linear-gradient(90deg, #1A7A4A, #2ECC71)' }"></div>

    <div class="flex items-start gap-5 mb-5">
      <div
        class="w-[72px] h-[72px] rounded-full shrink-0 flex items-center justify-center text-2xl font-extrabold text-white tracking-[-1px]"
        :style="{ background: 'linear-gradient(135deg, #2ECC71, #1A7A4A)', boxShadow: '0 0 0 4px var(--bg-surface), 0 0 0 6px #C8E6D5' }"
      >{{ client.initials }}</div>

      <div class="flex-1">
        <div class="text-[22px] font-extrabold text-(--text-primary) tracking-[-0.4px] mb-1">{{ client.name }}</div>
        <div class="text-sm text-primary dark:text-(--green-light) font-semibold mb-3 flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.3"/>
            <circle cx="6.5" cy="6.5" r="2" fill="currentColor"/>
          </svg>
          {{ client.goal }}
        </div>

        <div class="flex items-center flex-wrap">
          <div
            v-for="(stat, i) in client.stats"
            :key="i"
            class="flex items-center gap-1.5 text-[13px] text-[#3D5A45] dark:text-(--text-secondary) pr-4 mr-4 border-r border-[#E5EDE8] dark:border-(--border) last:border-r-0 last:mr-0 last:pr-0"
          >
            <span v-html="stat.iconSvg" class="text-primary dark:text-(--green-light)"></span>
            <template v-if="stat.leadingText">{{ stat.leadingText }}</template>
            <span class="font-semibold text-(--text-primary)">{{ stat.value }}</span>
            <template v-if="stat.trailingText">{{ stat.trailingText }}</template>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-end gap-2.5 shrink-0">
        <div class="flex items-center gap-1.5">
          <span class="inline-flex items-center gap-1 text-[11px] font-bold bg-(--green-pale) dark:bg-(--bg-primary-soft) text-primary dark:text-(--green-light) py-[3px] px-2.5 rounded-[20px]">
            <span class="w-1.5 h-1.5 rounded-full bg-primary dark:bg-(--green-light)"></span>
            Active
          </span>
          <span v-if="client.streakWeeks" class="text-[11px] font-bold bg-[#EBF5FB] dark:bg-[#3498DB]/15 text-[#3498DB] py-[3px] px-2.5 rounded-[20px]">🔥 {{ client.streakWeeks }}-week streak</span>
        </div>
        <div class="text-xs text-[#8FAD97] dark:text-(--text-muted) text-right">
          Last check-in: <strong class="text-primary dark:text-(--green-light)">{{ client.lastCheckIn }}</strong>
        </div>
      </div>
    </div>

    <div>
      <div class="flex items-center justify-between text-xs font-semibold text-[#6B8F72] dark:text-(--text-muted) mb-1.5">
        <span>Program Progress</span>
        <strong class="text-(--text-primary)">Week {{ client.programWeek }} of {{ client.programTotal }} — {{ progressPct }}% complete</strong>
      </div>
      <div class="h-2 bg-[#E8F2EC] dark:bg-white/5 rounded-[10px] overflow-hidden">
        <div
          class="h-full rounded-[10px] relative"
          :style="{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #1A7A4A, #2ECC71)' }"
        >
          <span class="absolute -right-px top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary dark:bg-(--green-light) border-2 border-(--bg-surface) ring-2 ring-primary dark:ring-(--green-light)"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface ClientProfileStat {
  iconSvg: string
  leadingText?: string
  value: string
  trailingText?: string
}

export interface ClientProfile {
  initials: string
  name: string
  goal: string
  stats: ClientProfileStat[]
  streakWeeks?: number
  lastCheckIn: string
  programWeek: number
  programTotal: number
}

const props = defineProps<{
  client: ClientProfile
}>()

const progressPct = computed(() => Math.round((props.client.programWeek / props.client.programTotal) * 100))
</script>
