<script setup lang="ts">
import Avatar from '~/components/Avatar.vue'

type SessionStatus = 'virtual' | 'confirmed' | 'pending'

defineEmits<{ schedule: [] }>()

defineProps<{
  sessions: Array<{
    time: string
    initials: string
    variant: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
    name: string
    meta: string
    status: SessionStatus
    statusLabel: string
  }>
}>()

const badgeClass = (s: SessionStatus) => ({
  confirmed: 'bg-(--green-pale) text-primary dark:bg-(--bg-primary-soft) dark:text-(--green-light)',
  pending: 'bg-[#FEF3EA] text-[#E67E22] dark:bg-[#E67E22]/15',
  virtual: 'bg-[#EBF5FB] text-[#3498DB] dark:bg-[#3498DB]/15',
}[s])
</script>

<template>
  <div class="bg-(--bg-surface) rounded-xl border border-(--border) overflow-hidden">
    <header
      class="flex items-center justify-between py-[18px] px-[22px] pb-3.5 border-b border-[#F0F4F1] dark:border-white/5">
      <span class="text-[15px] font-bold text-(--text-primary)">Today's Sessions</span>
      <a href="#" class="text-xs font-semibold text-primary dark:text-(--green-light) cursor-pointer no-underline">View
        Calendar →</a>
    </header>
    <div v-if="sessions.length">
      <div v-for="(s, i) in sessions" :key="s.name"
        class="flex items-center gap-3.5 py-3.5 px-[22px] transition-colors duration-100 hover:bg-[#F9FBF9] dark:hover:bg-white/3"
        :class="i < sessions.length - 1 ? 'border-b border-[#F0F4F1] dark:border-white/5' : ''">
        <div class="text-[13px] font-bold text-primary dark:text-(--green-light) min-w-[54px]">{{ s.time }}</div>
        <Avatar :initials="s.initials" :variant="s.variant" :size="34" />
        <div class="flex-1">
          <div class="text-sm font-semibold text-(--text-primary)">{{ s.name }}</div>
          <div class="text-xs text-(--text-muted) mt-0.5">{{ s.meta }}</div>
        </div>
        <span class="text-[11px] font-semibold py-[3px] px-2.5 rounded-[20px]" :class="badgeClass(s.status)">{{
          s.statusLabel }}</span>
      </div>
    </div>
    <EmptyState
      v-else
      icon="i-lucide-calendar-x-2"
      headline="No sessions today"
      hint="Your calendar is clear. Schedule a session with a client to get started."
      cta="Schedule session"
      @cta="$emit('schedule')"
    />
  </div>
</template>
