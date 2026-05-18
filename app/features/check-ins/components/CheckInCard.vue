<template>
  <button
    type="button"
    class="ci-card"
    :class="{ 'ci-card-selected': selected }"
    @click="$emit('select', card.id)"
  >
    <span v-if="card.unread" class="absolute top-3.5 right-3.5 w-[9px] h-[9px] rounded-full bg-[#E74C3C] ring-2 ring-white dark:ring-(--bg-surface)"></span>

    <div class="flex items-center gap-2.5 mb-2">
      <Avatar :initials="card.initials" :variant="card.variant" :size="36" />
      <div class="flex-1 min-w-0 text-left">
        <div class="text-sm font-bold text-(--text-primary)">{{ card.name }}</div>
        <div class="text-[11px] text-[#8FAD97] dark:text-(--text-muted) mt-0.5">{{ card.week }} · {{ card.submittedLabel }}</div>
      </div>
      <span v-if="card.streakWeeks" class="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#E67E22] bg-[#FEF3EA] dark:bg-[#E67E22]/15 py-[3px] px-2 rounded-[10px] shrink-0">🔥 {{ card.streakWeeks }} wks</span>
      <span v-else-if="card.responded" class="inline-flex items-center gap-1 text-[10px] font-bold text-primary dark:text-(--green-light) bg-(--green-pale) dark:bg-(--bg-primary-soft) py-[3px] px-2 rounded-[10px] shrink-0">
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <path d="M1.5 4.5l2 2 4-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Responded
      </span>
    </div>

    <div class="flex gap-[5px] flex-wrap mb-2">
      <MiniMetricBadge
        v-for="(m, i) in card.metrics"
        :key="i"
        :label="m.label"
        :tone="m.tone"
        :icon="m.icon"
      />
    </div>

    <div class="text-xs text-[#6B8F72] dark:text-(--text-muted) leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap text-left">{{ card.preview }}</div>
  </button>
</template>

<script setup lang="ts">
import Avatar from '~/components/Avatar.vue'
import MiniMetricBadge, { type MiniMetricTone, type MiniMetricIcon } from './MiniMetricBadge.vue'

export interface CheckInSummary {
  id: string
  initials: string
  variant: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
  name: string
  week: string
  submittedLabel: string
  unread?: boolean
  responded?: boolean
  streakWeeks?: number
  preview: string
  metrics: Array<{ label: string; tone?: MiniMetricTone; icon?: MiniMetricIcon }>
  group: 'unread' | 'responded'
}

defineProps<{
  card: CheckInSummary
  selected: boolean
}>()

defineEmits<{
  select: [id: string]
}>()
</script>

<style scoped>
.ci-card {
  position: relative;
  display: block;
  width: 100%;
  background: var(--bg-surface);
  border-bottom: 1px solid #F0F4F1;
  padding: 14px 16px;
  cursor: pointer;
  border-left: 4px solid transparent;
  border-right: none;
  border-top: none;
  transition: background .1s, border-left-color .15s;
  text-align: left;
}
.ci-card:last-child { border-bottom: none; }
.ci-card:hover { background: #F9FBF9; }

.ci-card-selected {
  border-left-color: var(--green-brand);
  background: #F4FAF7;
}
.ci-card-selected:hover { background: #F4FAF7; }
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .ci-card { border-bottom-color: var(--border-muted); }
.dark .ci-card:hover { background: rgba(255,255,255,.03); }
.dark .ci-card-selected { border-left-color: var(--green-light); background: var(--bg-primary-soft); }
.dark .ci-card-selected:hover { background: var(--bg-primary-soft); }
</style>
