<template>
  <ClientProfileCard title="Quick Info" link-label="Edit" body-class="pt-2 pb-2">
    <template #icon>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="5" r="3" stroke="currentColor" stroke-width="1.3"/>
        <path d="M2 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      </svg>
    </template>

    <div
      v-for="(row, i) in rows"
      :key="row.label"
      class="flex items-start justify-between py-2.5 text-[13px]"
      :class="i < rows.length - 1 ? 'border-b border-[#F5F7F5] dark:border-(--border)' : ''"
    >
      <span class="text-[#6B8F72] dark:text-(--text-muted) font-medium shrink-0 w-[130px]">{{ row.label }}</span>
      <span class="text-right" :class="valueClass(row.tone)">
        <template v-if="row.tone === 'link'">
          <a href="#" class="text-primary dark:text-(--green-light) no-underline font-semibold">{{ row.value }}</a>
        </template>
        <template v-else>
          {{ row.value }}
          <span v-if="row.suffix" class="ml-1 text-[11px]" :class="row.suffixClass ?? 'text-primary dark:text-(--green-light)'">{{ row.suffix }}</span>
        </template>
      </span>
    </div>
  </ClientProfileCard>
</template>

<script setup lang="ts">
import ClientProfileCard from './ClientProfileCard.vue'

export type InfoTone = 'default' | 'health' | 'link'

export interface InfoRow {
  label: string
  value: string
  suffix?: string
  suffixClass?: string
  tone?: InfoTone
}

defineProps<{
  rows: InfoRow[]
}>()

const valueClass = (t?: InfoTone) => ({
  default: 'text-(--text-primary) font-semibold',
  health:  'text-[#E67E22] font-semibold text-xs',
  link:    'text-primary dark:text-(--green-light) font-semibold',
}[t ?? 'default'])
</script>
