<template>
  <div class="w-[42%] shrink-0 overflow-y-auto flex flex-col rounded-[14px] border border-[#E5EDE8] dark:border-(--border) bg-(--bg-surface) custom-scrollbar">
    <template v-for="(card, i) in unread" :key="card.id">
      <CheckInCard
        :card="card"
        :selected="selectedId === card.id"
        @select="$emit('update:selectedId', card.id)"
      />
    </template>

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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CheckInCard, { type CheckInSummary } from './CheckInCard.vue'

const props = defineProps<{
  cards: CheckInSummary[]
  selectedId: string | null
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
