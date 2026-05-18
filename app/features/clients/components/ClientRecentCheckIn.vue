<template>
  <ClientProfileCard title="Most Recent Check-in" link-label="View all" @link-click="$emit('view-all')">
    <template #icon>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M2 3h11M2 7h9M2 11h6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      </svg>
    </template>

    <div class="text-[11px] font-semibold text-[#8FAD97] dark:text-(--text-muted) mb-2.5 uppercase tracking-[0.5px]">
      Week {{ checkIn.week }} · {{ checkIn.submittedLabel }}
    </div>

    <div class="mb-3.5">
      <div class="flex items-center justify-between text-xs font-semibold text-[#6B8F72] dark:text-(--text-muted) mb-1.5">
        <span>Energy this week</span>
        <strong class="text-lg font-extrabold text-primary dark:text-(--green-light)">{{ checkIn.energy }} / 10</strong>
      </div>
      <div class="flex gap-[3px]">
        <div
          v-for="i in 10"
          :key="i"
          class="flex-1 h-1.5 rounded-[3px]"
          :class="segmentClass(i)"
        ></div>
      </div>
    </div>

    <div class="text-[13px] italic text-[#3D5A45] dark:text-(--text-secondary) leading-[1.6] py-2.5 px-3.5 bg-[#F7FAF8] dark:bg-white/[.03] border-l-[3px] border-(--green-brand) dark:border-(--green-light) rounded-r-lg mb-3.5">{{ checkIn.quote }}</div>

    <div class="flex gap-3 flex-wrap">
      <div v-for="pill in checkIn.pills" :key="pill.label" class="flex items-center gap-1.5 text-xs font-medium text-[#6B8F72] dark:text-(--text-muted)">
        <span v-html="pill.iconSvg" class="text-primary dark:text-(--green-light)"></span>
        {{ pill.label }}
      </div>
    </div>

    <div class="mt-3.5">
      <button type="button" class="inline-flex items-center gap-1 text-xs font-bold text-primary dark:text-(--green-light) hover:underline" @click="$emit('view-all')">
        View full check-in &amp; respond
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 3l4 3-4 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
  </ClientProfileCard>
</template>

<script setup lang="ts">
import ClientProfileCard from './ClientProfileCard.vue'

export interface RecentCheckInPill {
  iconSvg: string
  label: string
}

export interface RecentCheckIn {
  week: number
  submittedLabel: string
  energy: number
  quote: string
  pills: RecentCheckInPill[]
}

const props = defineProps<{
  checkIn: RecentCheckIn
}>()

defineEmits<{
  'view-all': []
}>()

const segmentClass = (i: number) => {
  const energy = props.checkIn.energy
  if (i > energy) return 'bg-[#E8F2EC] dark:bg-white/[.06]'
  // First half (1-4) filled darker, second half (5-8) lighter
  if (i <= Math.ceil(energy / 2)) return 'bg-primary dark:bg-(--green-light)'
  return 'bg-(--green-light) dark:bg-(--green-light)/60'
}
</script>
