<template>
  <div class="py-5 px-6 border-b border-[#F0F4F1] dark:border-(--border) sticky top-0 bg-(--bg-surface) z-20 shrink-0">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="relative">
          <Avatar :initials="client.initials" :variant="client.variant" :size="44" class="ring-[3px] ring-white dark:ring-(--bg-surface) shadow-[0_0_0_5px_#C8E6D5] dark:shadow-[0_0_0_5px_var(--bg-primary-soft)]" />
        </div>
        <div>
          <div class="text-[18px] font-extrabold text-(--text-primary) tracking-[-0.3px]">{{ client.name }}</div>
          <div class="text-xs text-[#6B8F72] dark:text-(--text-muted) mt-0.5">
            {{ week.label }} — Submitted
            <strong class="text-primary dark:text-(--green-light) font-semibold"> {{ week.submittedAt }}</strong>
          </div>
        </div>
      </div>

      <div class="flex gap-2 items-center">
        <div class="flex items-center gap-1.5">
          <button type="button" class="wnav-btn" :disabled="!hasPrev" title="Previous week">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 3L4 6l4 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="text-xs font-semibold text-(--text-primary)">Wk {{ week.current }} / {{ week.total }}</span>
          <button type="button" class="wnav-btn" :disabled="!hasNext" :title="hasNext ? 'Next week' : 'No newer check-in'">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4 3l4 3-4 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <button type="button" class="btn-icon" title="View client profile">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="5" r="2.5" stroke="currentColor" stroke-width="1.3"/>
            <path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Avatar from '~/components/Avatar.vue'

export interface DetailClient {
  initials: string
  variant: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
  name: string
}

export interface DetailWeek {
  label: string
  submittedAt: string
  current: number
  total: number
}

withDefaults(defineProps<{
  client: DetailClient
  week: DetailWeek
  hasPrev?: boolean
  hasNext?: boolean
}>(), {
  hasPrev: true,
  hasNext: false,
})
</script>

<style scoped>
.wnav-btn, .btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: var(--bg-surface);
  border: 1.5px solid #D1E0D5;
  color: #6B8F72;
  transition: border-color .12s, color .12s, background .12s, opacity .12s;
}
.wnav-btn { width: 26px; height: 26px; border-radius: 6px; }
.btn-icon { width: 34px; height: 34px; border-radius: 8px; }
.wnav-btn:hover:not(:disabled), .btn-icon:hover { border-color: var(--green-brand); color: var(--green-brand); background: #F0F9F4; }
.wnav-btn:disabled { opacity: .35; cursor: not-allowed; }
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .wnav-btn, .dark .btn-icon {
  border-color: var(--border);
  color: var(--text-muted);
}
.dark .wnav-btn:hover:not(:disabled), .dark .btn-icon:hover {
  background: var(--bg-primary-soft);
  color: var(--green-light);
  border-color: var(--green-light);
}
</style>
