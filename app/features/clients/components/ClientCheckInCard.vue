<template>
  <div class="bg-(--bg-surface) border border-[#E5EDE8] dark:border-(--border) rounded-[14px] overflow-hidden transition-[box-shadow,border-color] duration-150 hover:border-(--green-soft) hover:shadow-[0_4px_16px_rgba(26,122,74,0.08)]">
    <div class="flex items-center justify-between py-4 px-5 pb-3 border-b border-[#F0F4F1] dark:border-(--border)">
      <div>
        <div class="text-[15px] font-bold text-(--text-primary)">Week {{ checkIn.week }} Check-in</div>
        <div class="text-xs text-[#8FAD97] dark:text-(--text-muted) mt-0.5">Submitted {{ checkIn.submittedLabel }}</div>
      </div>
      <span v-if="checkIn.unread" class="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#E74C3C] bg-[#FEECEC] dark:bg-[#E74C3C]/15 py-1 px-2.5 rounded-[20px]">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <circle cx="5" cy="5" r="4" stroke="currentColor" stroke-width="1.3"/>
          <path d="M5 3v2.5M5 7v.3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        Needs Response
      </span>
      <span v-else class="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary dark:text-(--green-light) bg-(--green-pale) dark:bg-(--bg-primary-soft) py-1 px-2.5 rounded-[20px]">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Responded
      </span>
    </div>

    <div class="py-4 px-5">
      <div class="flex gap-2.5 flex-wrap mb-3.5">
        <div v-for="m in checkIn.metrics" :key="m.label" class="flex items-center gap-1.5 bg-[#F7FAF8] dark:bg-white/[.03] border border-[#E8F0EB] dark:border-(--border) rounded-lg py-2 px-3 text-[13px] flex-1 min-w-[100px]">
          <span v-html="m.iconSvg" class="text-primary dark:text-(--green-light) shrink-0"></span>
          <div>
            <span class="text-[11px] text-[#8FAD97] dark:text-(--text-muted) block">{{ m.label }}</span>
            <span class="text-sm font-bold" :class="valueClass(m.tone)">
              {{ m.value }}
              <span
                v-if="m.badge"
                class="text-xs font-bold py-0.5 px-2 rounded-[10px] ml-1"
                :class="badgeClass(m.badge.tone)"
              >{{ m.badge.label }}</span>
            </span>
          </div>
        </div>
      </div>
      <div
        class="text-[13px] text-[#3D5A45] dark:text-(--text-secondary) leading-[1.6] bg-[#F7FAF8] dark:bg-white/[.03] rounded-lg py-2.5 px-3.5 border-l-[3px] line-clamp-2"
        :class="checkIn.negative ? 'border-[#F1948A]' : 'border-(--green-soft)'"
      >{{ checkIn.notePreview }}</div>
    </div>

    <div class="flex items-center justify-between py-3 px-5 bg-[#FAFCFB] dark:bg-white/[.02] border-t border-[#F0F4F1] dark:border-(--border)">
      <template v-if="checkIn.reply">
        <div class="flex items-start gap-2 flex-1">
          <Avatar :initials="checkIn.reply.initials" variant="a" :size="26" />
          <div>
            <div class="text-[11px] font-semibold text-primary dark:text-(--green-light) mb-px">{{ checkIn.reply.label }}</div>
            <div class="text-xs italic text-[#6B8F72] dark:text-(--text-muted) leading-[1.5] line-clamp-1">{{ checkIn.reply.text }}</div>
          </div>
        </div>
        <button type="button" class="btn-view ml-3" @click="$emit('view', checkIn.id)">View →</button>
      </template>
      <template v-else>
        <div class="text-xs italic text-[#8FAD97] dark:text-(--text-muted)">No response sent yet</div>
        <button type="button" class="btn-respond ml-3" @click="$emit('respond', checkIn.id)">Respond →</button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import Avatar from '~/components/Avatar.vue'

export type CheckInValueTone = 'default' | 'green' | 'warn' | 'red'

export interface CheckInMetric {
  iconSvg: string
  label: string
  value: string
  tone?: CheckInValueTone
  badge?: { label: string; tone: 'full' | 'part' | 'miss' }
}

export interface CheckInReply {
  initials: string
  label: string
  text: string
}

export interface ProfileCheckIn {
  id: string
  week: number
  submittedLabel: string
  unread?: boolean
  negative?: boolean
  metrics: CheckInMetric[]
  notePreview: string
  reply?: CheckInReply
}

defineProps<{
  checkIn: ProfileCheckIn
}>()

defineEmits<{
  respond: [id: string]
  view: [id: string]
}>()

const valueClass = (t?: CheckInValueTone) => ({
  default: 'text-(--text-primary)',
  green:   'text-primary dark:text-(--green-light)',
  warn:    'text-[#E67E22]',
  red:     'text-[#E74C3C]',
}[t ?? 'default'])

const badgeClass = (t: 'full' | 'part' | 'miss') => ({
  full: 'bg-(--green-pale) dark:bg-(--bg-primary-soft) text-primary dark:text-(--green-light)',
  part: 'bg-[#FEF3EA] dark:bg-[#E67E22]/15 text-[#E67E22]',
  miss: 'bg-[#FEECEC] dark:bg-[#E74C3C]/15 text-[#E74C3C]',
}[t])
</script>

<style scoped>
.btn-respond {
  background: transparent;
  border: 1.5px solid var(--green-brand);
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 700;
  color: var(--green-brand);
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s, color .15s;
  flex-shrink: 0;
}
.btn-respond:hover { background: var(--green-brand); color: #fff; }

.btn-view {
  background: transparent;
  border: 1.5px solid #D1E0D5;
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #6B8F72;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color .15s, color .15s;
  flex-shrink: 0;
}
.btn-view:hover { border-color: var(--green-brand); color: var(--green-brand); }
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .btn-respond { border-color: var(--green-light); color: var(--green-light); }
.dark .btn-respond:hover { background: var(--green-light); color: var(--green-deep); }
.dark .btn-view { border-color: var(--border); color: var(--text-secondary); }
.dark .btn-view:hover { border-color: var(--green-light); color: var(--green-light); }
</style>
