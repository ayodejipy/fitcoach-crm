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
  virtual:  'bg-(--info)',
  inperson: 'bg-(--green-brand)',
  group:    'bg-[#9B59B6]',
})[props.sessionType])

const onClick = (e: MouseEvent) => { emit('click', e) }
</script>

<template>
  <button
    type="button"
    class="session absolute left-[3px] right-[3px] rounded-md py-1.5 px-2 cursor-pointer z-10 overflow-hidden text-left transition-[filter,transform,box-shadow] focus:outline-none focus-visible:ring-2 focus-visible:ring-(--text-primary)/30"
    :class="[sessionClass, { 'opacity-[.82]': unconfirmed, 'is-short': short }]"
    :style="{ top: `${top}px`, height: `${height}px` }"
    :aria-label="`${client}, ${type}, ${time}`"
    @click="onClick"
  >
    <div class="text-[11.5px] font-semibold text-white leading-tight truncate">{{ client }}</div>
    <div v-if="!short" class="text-[10px] text-white/85 mt-0.5 truncate">{{ type }}</div>
    <div v-else class="text-[10px] text-white/85 mt-0.5 truncate">{{ shortType }}</div>
    <div v-if="!short" class="text-[10px] text-white/70 mt-px tabular-nums">{{ time }}</div>

    <div v-if="!short && badge" class="mt-1 inline-flex items-center gap-1 text-[9.5px] font-semibold bg-white/20 rounded-sm py-px px-1.5 text-white">
      <UIcon name="i-lucide-users" class="size-2.5" />
      {{ badge }}
    </div>
  </button>
</template>

<style scoped>
.session:hover {
  filter: brightness(1.06);
  transform: scaleX(1.01);
  box-shadow: 0 4px 14px rgba(0, 0, 0, .18);
  z-index: 20;
}
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
.session.is-short > .text-\[11\.5px\] { font-size: 10.5px; }
</style>
