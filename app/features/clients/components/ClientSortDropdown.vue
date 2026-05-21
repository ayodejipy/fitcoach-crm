<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export type SortState = {
  column: 'name' | 'startDate' | 'lastCheckIn'
  direction: 'asc' | 'desc'
}

type SortOption = {
  key: string
  label: string
  column: SortState['column']
  direction: SortState['direction']
}

const model = defineModel<SortState>({ required: true })

const GROUPS: SortOption[][] = [
  [
    { key: 'lastCheckIn-desc', label: 'Last check-in',  column: 'lastCheckIn', direction: 'desc' },
    { key: 'name-asc',         label: 'Name A–Z',       column: 'name',        direction: 'asc'  },
    { key: 'name-desc',        label: 'Name Z–A',       column: 'name',        direction: 'desc' },
  ],
  [
    { key: 'startDate-desc',   label: 'Newest client',  column: 'startDate',   direction: 'desc' },
    { key: 'startDate-asc',    label: 'Oldest client',  column: 'startDate',   direction: 'asc'  },
  ],
]

const DEFAULT_KEY = 'lastCheckIn-desc'

const activeKey = computed(() => `${model.value.column}-${model.value.direction}`)
const allOptions = computed(() => GROUPS.flat())
const activeLabel = computed(
  () => allOptions.value.find(o => o.key === activeKey.value)?.label ?? 'Last check-in',
)
const isActive = computed(() => activeKey.value !== DEFAULT_KEY)

const open = ref(false)
const btnRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

function select(opt: SortOption) {
  model.value = { column: opt.column, direction: opt.direction }
  open.value = false
}

const onDocClick = (e: MouseEvent) => {
  const t = e.target as Node
  if (btnRef.value?.contains(t) || menuRef.value?.contains(t)) return
  open.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div class="relative inline-block">
    <button
      ref="btnRef"
      type="button"
      class="border-[1.5px] border-[#D1E0D5] dark:border-(--border) rounded-lg px-[14px] py-2 text-[13px] font-semibold text-[#3D5A45] dark:text-(--text-secondary) bg-(--bg-surface) cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap transition-colors hover:border-(--green-brand) hover:bg-[#F0F9F4] hover:text-(--green-brand) dark:hover:bg-(--bg-primary-soft) dark:hover:text-(--green-light)"
      :class="isActive && 'border-(--green-brand)! text-(--green-brand)! bg-[#F0F9F4]! dark:border-(--green-light)! dark:text-(--green-light)! dark:bg-(--bg-primary-soft)!'"
      @click.stop="open = !open"
    >
      <UIcon name="i-lucide-arrow-up-down" class="w-3.5 h-3.5 shrink-0" />
      <span>Sort: <strong>{{ activeLabel }}</strong></span>
      <UIcon
        name="i-lucide-chevron-down"
        class="w-2.5 h-2.5 shrink-0 opacity-50 transition-transform duration-150"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <Transition name="dd">
      <div
        v-if="open"
        ref="menuRef"
        class="absolute right-0 top-[calc(100%+6px)] min-w-[196px] bg-(--bg-surface) border border-(--border) rounded-[12px] shadow-[0_8px_28px_rgba(0,0,0,.12),0_2px_8px_rgba(0,0,0,.07)] z-[300] p-1.5"
        @click.stop
      >
        <template v-for="(group, gi) in GROUPS" :key="gi">
          <div v-if="gi > 0" class="h-px bg-[#F0F4F1] dark:bg-white/5 my-1" />
          <button
            v-for="opt in group"
            :key="opt.key"
            type="button"
            class="w-full flex items-center gap-2 px-3 py-[9px] rounded-lg text-[13px] font-medium text-(--text-secondary) cursor-pointer transition-colors bg-transparent border-none text-left whitespace-nowrap font-[inherit] hover:bg-[#F0F9F4] dark:hover:bg-(--bg-primary-soft)"
            :class="activeKey === opt.key && 'text-(--green-brand)! font-bold! bg-[#F0F9F4]! dark:text-(--green-light)! dark:bg-(--bg-primary-soft)!'"
            @click="select(opt)"
          >
            <UIcon
              name="i-lucide-check"
              class="w-3 h-3 shrink-0 transition-opacity"
              :class="activeKey === opt.key ? 'opacity-100' : 'opacity-0'"
            />
            {{ opt.label }}
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dd-enter-active, .dd-leave-active { transition: opacity .12s, transform .12s; }
.dd-enter-from, .dd-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
