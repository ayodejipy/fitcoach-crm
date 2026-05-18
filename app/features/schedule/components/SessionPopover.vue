<template>
  <Teleport to="body">
    <div
      v-if="open && session"
      ref="popEl"
      class="pop fixed z-[9000] bg-(--bg-surface) border border-(--border) rounded-xl w-[280px] overflow-hidden"
      :style="{ left: `${pos.left}px`, top: `${pos.top}px` }"
      @click.stop
    >
      <button
        type="button"
        class="pop-close absolute top-2.5 right-2.5 w-6 h-6 rounded-md border-none bg-transparent cursor-pointer text-[#8FAD97] flex items-center justify-center transition-colors"
        @click="$emit('close')"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>

      <div class="py-3.5 px-4 border-b border-(--border-muted)">
        <div
          class="inline-flex items-center gap-1.5 text-[11px] font-bold py-[3px] px-2.5 rounded-[20px] mb-2"
          :class="typeBadgeClass"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <rect x="1" y="2" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.2"/>
            <path d="M8 4.5l2-1.5v5L8 6.5" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
          </svg>
          <span>{{ typeBadgeLabel }}</span>
        </div>

        <div class="flex items-center gap-2.5">
          <Avatar :initials="session.initials" :variant="session.variant" :size="36" />
          <div class="min-w-0">
            <div class="text-[15px] font-bold text-(--text-primary) truncate">{{ session.client }}</div>
            <div class="text-xs text-(--text-muted) mt-px truncate">{{ session.type }}</div>
          </div>
        </div>
      </div>

      <div class="py-3 px-4">
        <div class="flex items-center gap-2 text-xs text-[#3D5A45] dark:text-(--text-secondary) py-[5px] border-b border-[#F5F7F5] dark:border-(--border-muted)">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" class="text-primary dark:text-(--green-light) shrink-0">
            <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.2"/>
            <path d="M6.5 3.5v3.5l2 1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          <span>{{ session.time }}</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-[#3D5A45] dark:text-(--text-secondary) py-[5px] border-b border-[#F5F7F5] dark:border-(--border-muted)">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" class="text-primary dark:text-(--green-light) shrink-0">
            <path d="M6.5 1C4.3 1 2.5 2.8 2.5 5c0 3 4 7 4 7s4-4 4-7c0-2.2-1.8-4-4-4z" stroke="currentColor" stroke-width="1.2"/>
            <circle cx="6.5" cy="5" r="1.5" stroke="currentColor" stroke-width="1.2"/>
          </svg>
          <span>{{ session.location }}</span>
        </div>
        <div class="flex items-center gap-2 text-xs py-[5px]">
          <svg v-if="session.status === 'confirmed'" width="13" height="13" viewBox="0 0 13 13" fill="none" class="shrink-0">
            <path d="M2 6.5l3 3 6-6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="text-primary dark:text-(--green-light)"/>
          </svg>
          <span :class="session.status === 'confirmed' ? 'text-primary dark:text-(--green-light) font-semibold' : 'text-[#E67E22] font-semibold'">
            {{ session.status === 'confirmed' ? 'Confirmed' : 'Awaiting confirmation' }}
          </span>
        </div>
      </div>

      <div class="py-2.5 px-4 bg-[#F9FBF9] dark:bg-white/[.02] border-t border-(--border-muted) flex gap-2 items-center">
        <button type="button" class="pop-btn-edit flex-1">✏ Edit</button>
        <button type="button" class="pop-btn-cancel flex-1">✕ Cancel</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, useTemplateRef, watch } from 'vue'
import Avatar from '~/components/Avatar.vue'
import type { SessionData } from './CalendarGrid.vue'

const props = defineProps<{
  open: boolean
  session: SessionData | null
  clientX: number
  clientY: number
}>()

defineEmits<{
  close: []
}>()

const popEl = useTemplateRef<HTMLElement>('popEl')
const pos = reactive({ left: 0, top: 0 })

const typeBadgeClass = computed(() => {
  if (!props.session) return ''
  return ({
    virtual:  'bg-[#EBF5FB] dark:bg-[#3498DB]/15 text-[#3498DB]',
    inperson: 'bg-[#E8F5EE] dark:bg-(--bg-primary-soft) text-primary dark:text-(--green-light)',
    group:    'bg-[#F4ECF7] dark:bg-[#9B59B6]/15 text-[#9B59B6]',
  })[props.session.sessionType]
})

const typeBadgeLabel = computed(() => {
  if (!props.session) return ''
  return ({
    virtual:  'Virtual · Zoom',
    inperson: 'In-Person',
    group:    'Group Session',
  })[props.session.sessionType]
})

watch(
  () => [props.open, props.clientX, props.clientY] as const,
  async ([isOpen]) => {
    if (!isOpen) return
    await nextTick()
    const el = popEl.value
    if (!el) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const pw = el.offsetWidth
    const ph = el.offsetHeight

    let left = props.clientX + 12
    let top = props.clientY - 20
    if (left + pw > vw - 16) left = props.clientX - pw - 12
    if (top + ph > vh - 16) top = vh - ph - 16
    if (top < 8) top = 8

    pos.left = left
    pos.top = top
  },
  { immediate: true },
)
</script>

<style scoped>
.pop {
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.08);
}
.pop-close:hover { background: #F0F4F1; }
.pop-btn-edit {
  padding: 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: 1.5px solid #D1E0D5;
  background: #fff;
  color: #3D5A45;
  cursor: pointer;
  transition: border-color .12s, color .12s, background .12s;
  text-align: center;
  font-family: inherit;
}
.pop-btn-edit:hover { border-color: var(--green-brand); color: var(--green-brand); background: #F0F9F4; }

.pop-btn-cancel {
  padding: 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: 1.5px solid #FAD7D3;
  background: #fff;
  color: #E74C3C;
  cursor: pointer;
  transition: background .12s;
  text-align: center;
  font-family: inherit;
}
.pop-btn-cancel:hover { background: #FEECEC; }
</style>

<style>
.dark .pop-close:hover { background: rgba(255, 255, 255, .06); }

.dark .pop-btn-edit { background: var(--bg-surface); color: var(--text-secondary); border-color: var(--border); }
.dark .pop-btn-edit:hover { border-color: var(--green-light); color: var(--green-light); background: var(--bg-primary-soft); }

.dark .pop-btn-cancel { background: var(--bg-surface); color: #F87171; border-color: rgba(248,113,113,.35); }
.dark .pop-btn-cancel:hover { background: rgba(248,113,113,.12); }
</style>
