<script setup lang="ts">
type TCheckIn = {
  name: string
  preview: string
  time: string
  unread: boolean
}

const { checkIns } = defineProps<{
  checkIns: TCheckIn[]
}>()
</script>

<template>
  <div class="bg-(--bg-surface) rounded-xl border border-(--border) overflow-hidden">
    <header
      class="flex items-center justify-between py-[18px] px-[22px] pb-3.5 border-b border-[#F0F4F1] dark:border-white/5">
      <span class="text-[15px] font-bold text-(--text-primary)">Pending Check-ins</span>
      <NuxtLink to="/check-ins" class="text-xs font-semibold text-primary dark:text-(--green-light) cursor-pointer no-underline">
        View All →
      </NuxtLink>
    </header>
    <div v-if="checkIns.length">
      <div v-for="(c, i) in checkIns" :key="c.name + c.time"
        class="flex items-start gap-3 py-3.5 px-[22px] transition-colors duration-100 hover:bg-[#F9FBF9] dark:hover:bg-white/3"
        :class="i < checkIns.length - 1 ? 'border-b border-[#F0F4F1] dark:border-white/5' : ''">
        <div class="w-2.5 h-2.5 rounded-full mt-[5px] shrink-0" :class="c.unread ? 'bg-[#E74C3C]' : 'bg-[#BDC3C7]'">
        </div>
        <div class="flex-1">
          <div class="text-[13px] font-semibold text-(--text-primary)">{{ c.name }}</div>
          <div class="text-xs text-(--text-muted) mt-[3px] leading-[1.4]">{{ c.preview }}</div>
          <div class="text-[11px] text-[#95A5A6] mt-1">{{ c.time }}</div>
        </div>
        <button
          type="button"
          class="self-center whitespace-nowrap text-[11px] font-semibold text-primary dark:text-(--green-light) py-1 px-2.5 border-[1.5px] border-primary dark:border-(--green-light) rounded-md cursor-pointer bg-transparent"
        >
          Respond
        </button>
      </div>
    </div>
    <EmptyState
      v-else
      icon="i-lucide-inbox"
      headline="All caught up!"
      hint="No check-ins waiting for your response. You're doing great."
      cta="View all check-ins"
      cta-to="/check-ins"
    />
  </div>
</template>
