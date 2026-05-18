<template>
  <div class="relative inline-block">
    <button
      ref="btnRef"
      type="button"
      class="w-8 h-8 rounded-lg inline-flex items-center justify-center cursor-pointer border-none bg-transparent text-[#8FAD97] transition-[background,color] duration-100 hover:bg-[#F0F4F1] dark:hover:bg-white/5 hover:text-primary dark:hover:text-(--green-light)"
      @click.stop="toggle"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="3.5" r="1.2" fill="currentColor"/>
        <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
        <circle cx="8" cy="12.5" r="1.2" fill="currentColor"/>
      </svg>
    </button>

    <Transition name="menu">
      <div
        v-if="open"
        ref="menuRef"
        class="absolute right-3 top-[calc(100%-4px)] min-w-[160px] bg-(--bg-surface) border border-(--border) rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.10),0_2px_6px_rgba(0,0,0,0.06)] z-50 py-1.5"
        @click.stop
      >
        <template v-for="(item, i) in items" :key="i">
          <div
            v-if="item.divider"
            class="h-px bg-[#F0F4F1] dark:bg-white/5 my-1"
          ></div>
          <button
            v-else
            type="button"
            class="w-full flex items-center gap-2.5 py-2.5 px-3.5 text-[13px] font-medium cursor-pointer transition-colors duration-100 whitespace-nowrap bg-transparent border-none text-left"
            :class="item.danger
              ? 'text-[#E74C3C] hover:bg-[#FEF3EA] dark:hover:bg-[#E74C3C]/10'
              : 'text-(--text-secondary) hover:bg-[#F0F9F4] dark:hover:bg-(--bg-primary-soft)'"
            @click="handleItemClick(item)"
          >
            <span class="shrink-0 w-[14px] h-[14px] flex items-center justify-center" v-html="item.icon ?? ''"></span>
            {{ item.label }}
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

export interface ActionItem {
  label?: string
  icon?: string     // inline SVG markup
  danger?: boolean
  divider?: boolean
  onClick?: () => void
}

defineProps<{
  items: ActionItem[]
}>()

const open = ref(false)
const btnRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const toggle = () => { open.value = !open.value }
const close = () => { open.value = false }

const handleItemClick = (item: ActionItem) => {
  item.onClick?.()
  close()
}

const onDocClick = (e: MouseEvent) => {
  const t = e.target as Node
  if (btnRef.value?.contains(t) || menuRef.value?.contains(t)) return
  close()
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<style scoped>
.menu-enter-active,
.menu-leave-active { transition: opacity .12s, transform .12s; }
.menu-enter-from,
.menu-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
