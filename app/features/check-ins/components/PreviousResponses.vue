<template>
  <div>
    <div class="section-label" style="margin-bottom: 0;">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.2"/>
        <path d="M6 3.5v3l2 1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
      Previous Responses
      <span class="text-[11px] font-semibold text-primary dark:text-(--green-light) bg-(--green-pale) dark:bg-(--bg-primary-soft) py-0.5 px-1.5 rounded-lg not-uppercase tracking-normal normal-case">{{ responses.length }} weeks</span>
    </div>

    <div class="mt-2.5 border border-[#E8F0EB] dark:border-(--border) rounded-xl overflow-hidden">
      <div
        v-for="(r, idx) in responses"
        :key="r.id"
        class="prev-item"
      >
        <button
          type="button"
          class="prev-trigger"
          :class="{ 'prev-trigger-muted': !r.coachText }"
          @click="toggle(r.id)"
        >
          <div class="flex items-start gap-2.5 flex-1 text-left min-w-0">
            <div class="shrink-0">
              <div class="text-[13px] font-bold text-(--text-primary)">{{ r.week }}</div>
              <div class="text-[11px] text-[#8FAD97] dark:text-(--text-muted)">{{ r.date }}</div>
            </div>
            <div class="min-w-0">
              <div class="flex gap-1.5 flex-wrap">
                <span
                  v-for="(m, i) in r.metrics"
                  :key="i"
                  class="text-[11px] font-medium text-[#6B8F72] dark:text-(--text-muted) bg-[#F7FAF8] dark:bg-white/[.03] border border-[#E8F0EB] dark:border-(--border) rounded-md py-[3px] px-2"
                >{{ m }}</span>
              </div>
              <div class="text-xs text-[#6B8F72] dark:text-(--text-muted) italic mt-0.5 overflow-hidden whitespace-nowrap text-ellipsis max-w-[260px]">{{ r.snippet }}</div>
            </div>
          </div>
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            class="prev-chevron shrink-0 text-[#6B8F72] dark:text-(--text-muted) transition-transform duration-200"
            :class="{ 'rotate-180': openId === r.id }"
          >
            <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div v-if="openId === r.id" class="prev-body">
          <template v-if="r.coachText">
            <div class="flex items-start gap-2.5">
              <Avatar :initials="r.coachInitials" :variant="r.coachVariant" :size="28" />
              <div>
                <div class="text-[11px] font-semibold text-primary dark:text-(--green-light) mb-0.5">Jordan responded · {{ r.coachRespondedAt }}</div>
                <div class="text-[13px] text-[#3D5A45] dark:text-(--text-secondary) leading-[1.6]">{{ r.coachText }}</div>
              </div>
            </div>
          </template>
          <div v-else class="text-xs text-[#8FAD97] dark:text-(--text-muted) py-1">Response content not available in this demo.</div>
        </div>
      </div>

      <div class="py-2.5 px-4 text-center bg-[#FAFCFB] dark:bg-white/[.02] border-t border-[#F0F4F1] dark:border-(--border)">
        <button type="button" class="text-xs font-semibold text-primary dark:text-(--green-light) inline-flex items-center gap-1.5 hover:underline">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Load 10 earlier responses
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Avatar from '~/components/Avatar.vue'

export interface PreviousResponse {
  id: string
  week: string
  date: string
  metrics: string[]
  snippet: string
  coachInitials: string
  coachVariant: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
  coachRespondedAt: string
  coachText: string
}

const props = defineProps<{
  responses: PreviousResponse[]
}>()

const openId = ref<string | null>(props.responses[0]?.id ?? null)

const toggle = (id: string) => {
  openId.value = openId.value === id ? null : id
}
</script>

<style scoped>
.section-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #8FAD97;
  display: flex;
  align-items: center;
  gap: 6px;
}
.section-label > span.normal-case {
  text-transform: none;
  letter-spacing: 0;
}

.prev-item { border-bottom: 1px solid #F0F4F1; }
.prev-item:last-child { border-bottom: none; }

.prev-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  background: #F7FAF8;
  width: 100%;
  border: none;
  transition: background .1s;
  user-select: none;
}
.prev-trigger:hover { background: #F0F9F4; }

.prev-trigger-muted { opacity: 0.7; }

.prev-body {
  padding: 14px 16px;
  background: var(--bg-surface);
  border-top: 1px solid #F0F4F1;
}
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .section-label { color: var(--text-muted); }
.dark .prev-item { border-bottom-color: var(--border); }
.dark .prev-trigger { background: rgba(255,255,255,.02); }
.dark .prev-trigger:hover { background: rgba(255,255,255,.05); }
.dark .prev-body { border-top-color: var(--border); }
</style>
