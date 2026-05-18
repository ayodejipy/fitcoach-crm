<template>
  <div>
    <StepHeader
      step-label="Step 4 of 4"
      title="Connect your tools"
      sub="Sync your existing apps so everything lives in one place. Skip any you don't use."
    >
      <template #icon>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="text-(--text-accent)">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </template>
    </StepHeader>

    <div class="card-body px-9 py-7 min-h-[340px] max-[600px]:px-5 max-[600px]:py-5">
      <div class="tool-connect-grid flex flex-col gap-3 mb-5">
        <div
          v-for="tool in tools"
          :key="tool.id"
          class="tool-card flex items-center gap-3.5 py-4 px-[18px] rounded-[14px] border-[1.5px] transition-[border-color,background] duration-200"
          :class="form.connectedTools.includes(tool.id)
            ? 'border-(--green-mid) bg-(--green-pale) dark:bg-(--bg-primary-soft)'
            : 'border-(--border) bg-(--bg-input) hover:border-(--green-soft) dark:hover:border-white/20'"
        >
          <div
            class="tool-logo w-[42px] h-[42px] rounded-[10px] flex items-center justify-center shrink-0"
            :class="tool.bg"
          >
            <component :is="tool.logoComp" />
          </div>
          <div class="flex-1">
            <div class="text-sm font-semibold text-(--text-primary)">{{ tool.name }}</div>
            <div class="text-xs text-(--text-secondary) mt-0.5">{{ tool.desc }}</div>
          </div>
          <div class="shrink-0">
            <div
              v-if="form.connectedTools.includes(tool.id)"
              class="tool-connected-badge flex items-center gap-1.5 text-[12.5px] font-semibold text-primary dark:text-(--green-light)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Connected
            </div>
            <button
              v-else-if="connecting === tool.id"
              type="button"
              class="tool-connect-btn h-[34px] px-4 rounded-lg border-[1.5px] border-(--border) bg-(--bg-surface) text-(--text-primary) text-[12.5px] font-semibold opacity-60 pointer-events-none whitespace-nowrap"
            >Connecting…</button>
            <button
              v-else
              type="button"
              class="tool-connect-btn h-[34px] px-4 rounded-lg border-[1.5px] border-(--border) bg-(--bg-surface) text-(--text-primary) text-[12.5px] font-semibold cursor-pointer transition-[border-color,background,color] duration-200 whitespace-nowrap hover:border-(--green-mid) hover:text-primary"
              @click="connect(tool.id)"
            >Connect</button>
          </div>
        </div>
      </div>

      <!-- Skip note -->
      <div class="skip-note flex items-start gap-2 py-3 px-3.5 bg-[rgba(245,158,11,0.07)] dark:bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] rounded-[10px]">
        <svg class="w-4 h-4 text-amber-500 shrink-0 mt-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p class="text-[12.5px] text-(--text-secondary) leading-[1.4]">
          <strong class="text-(--text-primary)">You can always connect tools later</strong> from Settings → Integrations. Nothing breaks if you skip this step.
        </p>
      </div>
    </div>

    <StepFooter
      show-back
      :progress="100"
      continue-label="Launch my dashboard"
      :loading="loading"
      loading-label="Setting up…"
      @back="$emit('prev')"
      @continue="$emit('finish')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import StepHeader from '../StepHeader.vue'
import StepFooter from '../StepFooter.vue'

const props = defineProps<{
  form: { connectedTools: string[] }
  loading?: boolean
}>()

defineEmits<{
  prev: []
  finish: []
}>()

const connecting = ref<string | null>(null)

const ZoomLogo = () => h('svg', { width: 26, height: 26, viewBox: '0 0 256 256', fill: 'none' }, [
  h('rect', { width: 256, height: 256, rx: 48, fill: '#2D8CFF' }),
  h('path', { d: 'M149.9 123.6l50.7-36.9c4.8-3.5 10.4-.5 10.4 5.2v81.4c0 5.7-5.6 8.7-10.4 5.2l-50.7-36.9v-18z', fill: 'white' }),
  h('rect', { x: 44, y: 78, width: 115, height: 100, rx: 16, fill: 'white' }),
])

const GcalLogo = () => h('svg', { width: 26, height: 26, viewBox: '0 0 256 256', fill: 'none' }, [
  h('rect', { width: 256, height: 256, rx: 8, fill: 'white' }),
  h('path', { d: 'M256 128h-128v128h128V128z', fill: '#3B82F6' }),
  h('path', { d: 'M128 0H0v128h128V0z', fill: '#EF4444' }),
  h('path', { d: 'M256 0H128v128h128V0z', fill: '#FBBF24' }),
  h('path', { d: 'M128 128H0v128h128V128z', fill: '#22C55E' }),
  h('circle', { cx: 128, cy: 128, r: 44, fill: 'white' }),
  h('text', { x: 128, y: 148, 'text-anchor': 'middle', 'font-family': 'Inter,sans-serif', 'font-size': 52, 'font-weight': 800, fill: '#1F2937' }, 'G'),
])

const StripeLogo = () => h('svg', { width: 26, height: 26, viewBox: '0 0 256 256', fill: 'none' }, [
  h('rect', { width: 256, height: 256, rx: 48, fill: '#635BFF' }),
  h('path', { d: 'M119.5 92c0-5.7 5.2-8.8 13-8.8 11.5 0 26 4.8 37 10.8V60.3C156.9 54.5 143.8 52 130.5 52c-30.7 0-51 15.8-51 42.2 0 41.3 58.3 34.6 58.3 52.4 0 6.8-6 9.8-14.3 9.8-12.4 0-28.4-5.5-41-13.1v34.6c14 6.2 28 8.8 41 8.8 31 0 52.5-15.5 52.5-42.2-.2-44.7-58.5-36.5-58.5-52.5z', fill: 'white' }),
])

const tools = [
  { id: 'zoom',   name: 'Zoom',             desc: 'Auto-generate meeting links for every session',      bg: 'bg-[#E8F0FE]', logoComp: ZoomLogo },
  { id: 'gcal',   name: 'Google Calendar',  desc: 'Sync sessions so clients can add to their calendar', bg: 'bg-[#FEF2E8]', logoComp: GcalLogo },
  { id: 'stripe', name: 'Stripe',           desc: 'Accept payments and automate billing from the dashboard', bg: 'bg-[#EEF0FB]', logoComp: StripeLogo },
]

const connect = (id: string) => {
  connecting.value = id
  setTimeout(() => {
    if (!props.form.connectedTools.includes(id)) props.form.connectedTools.push(id)
    connecting.value = null
  }, 1200)
}
</script>
