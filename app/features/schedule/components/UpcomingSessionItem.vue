<template>
  <div
    class="upcoming-item flex items-center gap-2.5 py-2.5 px-[18px] border-b border-[#F5F7F5] dark:border-(--border-muted) cursor-pointer transition-colors"
    :class="{ 'today-bg': today }"
  >
    <span
      class="text-xs font-bold"
      :class="past ? 'text-[#BDC3C7] dark:text-(--text-muted)' : 'text-primary dark:text-(--green-light)'"
    >{{ time }}</span>

    <Avatar :initials="initials" :variant="variant" :size="30" />

    <div class="flex-1 min-w-0">
      <div class="text-[13px] font-semibold text-(--text-primary) truncate">{{ name }}</div>
      <div class="text-[11px] text-[#8FAD97] dark:text-(--text-muted) mt-px truncate">{{ type }}</div>
    </div>

    <span
      class="text-[10px] font-bold py-0.5 px-[7px] rounded-md whitespace-nowrap"
      :class="status === 'confirmed' ? 'bg-(--green-pale) dark:bg-(--bg-primary-soft) text-primary dark:text-(--green-light)' : 'bg-[#FEF3EA] dark:bg-[#E67E22]/15 text-[#E67E22]'"
    >{{ status === 'confirmed' ? '✓' : '?' }}</span>
  </div>
</template>

<script setup lang="ts">
import Avatar from '~/components/Avatar.vue'

withDefaults(defineProps<{
  time: string
  initials: string
  variant: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
  name: string
  type: string
  status: 'confirmed' | 'pending'
  today?: boolean
  past?: boolean
}>(), {
  today: false,
  past: false,
})
</script>

<style scoped>
.upcoming-item:last-child { border-bottom: none; }
.upcoming-item:hover { background: #F9FBF9; }
.today-bg { background: #F7FBF8; }
</style>

<style>
.dark .upcoming-item:hover { background: rgba(255, 255, 255, .03); }
.dark .today-bg { background: rgba(46, 204, 113, .04); }
</style>
