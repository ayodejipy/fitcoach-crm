<template>
  <div class="w-[42%] shrink-0 overflow-y-auto flex flex-col rounded-[14px] border border-[#E5EDE8] dark:border-(--border) bg-(--bg-surface) custom-scrollbar">
    <template v-if="loading">
      <div v-for="n in 5" :key="n" class="flex items-start gap-3 p-4 border-b border-[#F0F4F1] dark:border-white/5 last:border-b-0">
        <USkeleton class="w-2.5 h-2.5 rounded-full mt-1 shrink-0" />
        <div class="flex-1 space-y-2">
          <USkeleton class="h-3.5 w-32" />
          <USkeleton class="h-3 w-full" />
          <USkeleton class="h-3 w-3/4" />
          <USkeleton class="h-3 w-16" />
        </div>
      </div>
    </template>

    <template v-else-if="cards.length">
      <CheckInCard
        v-for="card in unread"
        :key="card.id"
        :card="card"
        :selected="selectedId === card.id"
        @select="$emit('update:selectedId', card.id)"
      />

      <div
        v-if="responded.length"
        class="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.7px] text-[#8FAD97] dark:text-(--text-muted) bg-[#FAFCFB] dark:bg-white/[.02] border-t-[1.5px] border-[#F0F4F1] dark:border-(--border) border-b border-[#F0F4F1] dark:border-(--border)"
      >
        Previously Responded
      </div>

      <CheckInCard
        v-for="card in responded"
        :key="card.id"
        :card="card"
        :selected="selectedId === card.id"
        @select="$emit('update:selectedId', card.id)"
      />
    </template>

    <EmptyState
      v-else
      icon="i-lucide-clipboard-list"
      headline="No check-ins here"
      hint="When clients submit their weekly check-ins, they'll appear here."
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CheckInCard, { type CheckInSummary } from './CheckInCard.vue'

const props = defineProps<{
  cards: CheckInSummary[]
  selectedId: string | null
  loading?: boolean
}>()

defineEmits<{
  'update:selectedId': [id: string]
}>()

const unread    = computed(() => props.cards.filter((c) => c.group === 'unread'))
const responded = computed(() => props.cards.filter((c) => c.group === 'responded'))
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #D1E0D5; border-radius: 2px; }
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); }
</style>
