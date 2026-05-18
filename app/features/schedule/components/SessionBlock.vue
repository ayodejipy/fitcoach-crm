<template>
  <div
    class="session absolute left-[3px] right-[3px] rounded-lg py-1.5 px-2 cursor-pointer z-10 overflow-hidden transition-[filter,transform,box-shadow]"
    :class="[sessionClass, { 'opacity-[.82]': unconfirmed, 'is-short': short }]"
    :style="{ top: `${top}px`, height: `${height}px` }"
    @click="onClick"
  >
    <div class="text-xs font-bold text-white leading-[1.2] truncate">{{ client }}</div>
    <div v-if="!short" class="text-[10px] text-white/80 mt-0.5 truncate">{{ type }}</div>
    <div v-else class="text-[10px] text-white/80 mt-0.5 truncate">{{ shortType }}</div>
    <div v-if="!short" class="text-[10px] text-white/65 mt-px">{{ time }}</div>

    <div v-if="!short && badge" class="mt-[3px] inline-flex items-center gap-[3px] text-[9px] font-bold bg-white/20 rounded py-px px-[5px] text-white">
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <circle cx="2.5" cy="2.5" r="1.5" stroke="white" stroke-width="1"/>
        <circle cx="5.5" cy="2.5" r="1.5" stroke="white" stroke-width="1"/>
        <path d="M0 7c0-1.7 1.1-3 2.5-3s2.5 1.3 2.5 3" stroke="white" stroke-width="1"/>
        <path d="M5 4.5c1 .3 1.5 1 1.5 2.5" stroke="white" stroke-width="1" stroke-linecap="round"/>
      </svg>
      {{ badge }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type SessionType = 'virtual' | 'inperson' | 'group'

const props = defineProps<{
  client: string
  type: string
  shortType?: string
  time: string
  sessionType: SessionType
  top: number
  height: number
  short?: boolean
  unconfirmed?: boolean
  badge?: string
}>()

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const sessionClass = computed(() => ({
  virtual:  'bg-[#3498DB]',
  inperson: 'bg-primary',
  group:    'bg-[#9B59B6]',
})[props.sessionType])

const onClick = (e: MouseEvent) => { emit('click', e) }
</script>

<style scoped>
.session:hover {
  filter: brightness(1.06);
  transform: scaleX(1.01);
  box-shadow: 0 4px 14px rgba(0, 0, 0, .18);
  z-index: 20;
}
/* Striped top edge for unconfirmed sessions */
.session.opacity-\[\.82\]::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: repeating-linear-gradient(
    90deg,
    rgba(255,255,255,0.7) 0,
    rgba(255,255,255,0.7) 4px,
    transparent 4px,
    transparent 8px
  );
}
.session.is-short > .text-xs { font-size: 11px; }
</style>
