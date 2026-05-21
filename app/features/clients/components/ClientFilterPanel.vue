<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

export type ClientFilters = {
  goals: string[]
  plans: string[]
  checkIn: 'overdue' | 'late' | 'current' | null
}

const model = defineModel<ClientFilters>({ required: true })

const GOALS = [
  'Fat Loss', 'Muscle Gain', 'Nutrition + Fitness',
  'Strength Training', 'Athletic Performance',
  'Marathon / Endurance', 'General Fitness',
]

const PLANS = ['Starter', 'Pro Coaching', 'Custom']

const CHECKIN_OPTIONS = [
  { id: 'overdue' as const, label: 'Overdue (7+ days)' },
  { id: 'late'    as const, label: 'Late (5+ days)' },
  { id: 'current' as const, label: 'Up to date' },
]

const draft = reactive<ClientFilters>({ goals: [], plans: [], checkIn: null })

function syncDraft() {
  draft.goals = [...model.value.goals]
  draft.plans = [...model.value.plans]
  draft.checkIn = model.value.checkIn
}

function toggleGoal(g: string) {
  const i = draft.goals.indexOf(g)
  if (i >= 0) draft.goals.splice(i, 1)
  else draft.goals.push(g)
}

function togglePlan(p: string) {
  const i = draft.plans.indexOf(p)
  if (i >= 0) draft.plans.splice(i, 1)
  else draft.plans.push(p)
}

function clearDraft() {
  draft.goals = []
  draft.plans = []
  draft.checkIn = null
}

function apply() {
  model.value = { goals: [...draft.goals], plans: [...draft.plans], checkIn: draft.checkIn }
  open.value = false
}

function cancel() {
  syncDraft()
  open.value = false
}

const hasApplied = computed(
  () => model.value.goals.length > 0 || model.value.plans.length > 0 || model.value.checkIn !== null,
)
const hasDraft = computed(
  () => draft.goals.length > 0 || draft.plans.length > 0 || draft.checkIn !== null,
)

const open = ref(false)
const btnRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

const onDocClick = (e: MouseEvent) => {
  const t = e.target as Node
  if (btnRef.value?.contains(t) || panelRef.value?.contains(t)) return
  cancel()
}

onMounted(() => { syncDraft(); document.addEventListener('click', onDocClick) })
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div class="relative inline-block">
    <button
      ref="btnRef"
      type="button"
      class="border-[1.5px] border-[#D1E0D5] dark:border-(--border) rounded-lg px-[14px] py-2 text-[13px] font-semibold text-[#3D5A45] dark:text-(--text-secondary) bg-(--bg-surface) cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap transition-colors hover:border-(--green-brand) hover:bg-[#F0F9F4] hover:text-(--green-brand) dark:hover:bg-(--bg-primary-soft) dark:hover:text-(--green-light)"
      :class="hasApplied && 'border-(--green-brand)! text-(--green-brand)! bg-[#F0F9F4]! dark:border-(--green-light)! dark:text-(--green-light)! dark:bg-(--bg-primary-soft)!'"
      @click.stop="open = !open"
    >
      <UIcon name="i-lucide-sliders-horizontal" class="w-3.5 h-3.5 shrink-0" />
      Filter
      <span v-if="hasApplied" class="inline-block w-1.5 h-1.5 rounded-full bg-(--green-brand) dark:bg-(--green-light) ml-0.5" />
    </button>

    <Transition name="dd">
      <div
        v-if="open"
        ref="panelRef"
        class="absolute right-0 top-[calc(100%+6px)] w-[280px] bg-(--bg-surface) border border-(--border) rounded-[14px] shadow-[0_8px_28px_rgba(0,0,0,.12),0_2px_8px_rgba(0,0,0,.07)] z-[300] overflow-hidden"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3.5 border-b border-[#F0F4F1] dark:border-white/5">
          <span class="text-[13px] font-bold text-(--text-primary)">Filter clients</span>
          <button
            type="button"
            class="text-[12px] font-semibold text-primary dark:text-(--green-light) bg-transparent border-none cursor-pointer p-0 transition-opacity"
            :class="hasDraft ? 'opacity-100' : 'opacity-30 pointer-events-none'"
            @click="clearDraft"
          >Clear all</button>
        </div>

        <!-- Body -->
        <div class="px-4 py-3.5 flex flex-col gap-4">
          <div v-for="(section, si) in ([
            { label: 'Goal', items: GOALS, active: (g: string) => draft.goals.includes(g), toggle: toggleGoal },
            { label: 'Plan', items: PLANS, active: (p: string) => draft.plans.includes(p), toggle: togglePlan },
          ] as const)" :key="si">
            <p class="text-[11px] font-bold text-[#8FAD97] uppercase tracking-[0.6px] mb-2">{{ section.label }}</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="item in section.items"
                :key="item"
                type="button"
                class="px-3 py-[5px] rounded-[20px] border-[1.5px] border-[#D1E0D5] dark:border-(--border) bg-(--bg-surface) dark:bg-transparent text-[12px] font-semibold text-[#3D5A45] dark:text-(--text-secondary) cursor-pointer whitespace-nowrap font-[inherit] transition-all hover:border-(--green-brand) hover:text-(--green-brand) dark:hover:border-(--green-light) dark:hover:text-(--green-light)"
                :class="section.active(item) && 'bg-(--green-brand)! border-(--green-brand)! text-white! dark:bg-(--green-brand)! dark:border-(--green-brand)!'"
                @click="section.toggle(item)"
              >{{ item }}</button>
            </div>
          </div>

          <div>
            <p class="text-[11px] font-bold text-[#8FAD97] uppercase tracking-[0.6px] mb-2">Check-in</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="ci in CHECKIN_OPTIONS"
                :key="ci.id"
                type="button"
                class="px-3 py-[5px] rounded-[20px] border-[1.5px] border-[#D1E0D5] dark:border-(--border) bg-(--bg-surface) dark:bg-transparent text-[12px] font-semibold text-[#3D5A45] dark:text-(--text-secondary) cursor-pointer whitespace-nowrap font-[inherit] transition-all hover:border-(--green-brand) hover:text-(--green-brand) dark:hover:border-(--green-light) dark:hover:text-(--green-light)"
                :class="draft.checkIn === ci.id && 'bg-(--green-brand)! border-(--green-brand)! text-white! dark:bg-(--green-brand)! dark:border-(--green-brand)!'"
                @click="draft.checkIn = draft.checkIn === ci.id ? null : ci.id"
              >{{ ci.label }}</button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex gap-2 px-4 py-3 border-t border-[#F0F4F1] dark:border-white/5">
          <button
            type="button"
            class="flex-1 h-9 rounded-lg text-[13px] font-semibold cursor-pointer flex items-center justify-center border-[1.5px] border-[#D1E0D5] dark:border-(--border) bg-(--bg-surface) dark:bg-transparent text-[#3D5A45] dark:text-(--text-secondary) transition-all font-[inherit] hover:border-(--green-brand) hover:text-(--green-brand) dark:hover:border-(--green-light) dark:hover:text-(--green-light)"
            @click="cancel"
          >Cancel</button>
          <button
            type="button"
            class="flex-1 h-9 rounded-lg text-[13px] font-semibold cursor-pointer flex items-center justify-center border-[1.5px] border-(--green-brand) bg-(--green-brand) text-white font-[inherit] transition-all hover:bg-(--green-hover) hover:border-(--green-hover)"
            @click="apply"
          >Apply filters</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dd-enter-active, .dd-leave-active { transition: opacity .12s, transform .12s; }
.dd-enter-from, .dd-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
