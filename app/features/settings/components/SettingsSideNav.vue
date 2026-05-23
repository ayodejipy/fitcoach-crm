<template>
  <nav class="w-[210px] min-w-[210px] shrink-0 bg-(--bg-surface) border-r border-(--border) flex flex-col p-5 gap-0.5 overflow-y-auto">
    <template v-for="section in sections" :key="section.label">
      <div class="text-[10.5px] font-bold uppercase tracking-[0.7px] text-(--text-muted) py-1.5 px-2 pb-2 mb-0.5" :class="section.marginTop ? 'mt-2.5' : ''">
        {{ section.label }}
      </div>
      <button
        v-for="item in section.items"
        :key="item.id"
        type="button"
        class="snav-item flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-[13.5px] font-medium text-(--text-secondary) cursor-pointer select-none transition-colors hover:bg-(--bg-surface-muted) hover:text-(--text-primary)"
        :class="{ 'snav-item-active': modelValue === item.id }"
        @click="$emit('update:modelValue', item.id)"
      >
        <span class="w-[15px] h-[15px] shrink-0" v-html="item.iconSvg" />
        {{ item.label }}
        <span
          v-if="item.badge"
          class="ml-auto text-[10px] font-bold py-px px-1.5 rounded-[10px] bg-[#EF4444] text-white"
        >{{ item.badge }}</span>
      </button>
    </template>
  </nav>
</template>

<script setup lang="ts">
export interface SettingsNavItem {
  id: string
  label: string
  iconSvg: string
  badge?: number | string
}
export interface SettingsNavSection {
  label: string
  items: SettingsNavItem[]
  marginTop?: boolean
}

defineProps<{
  modelValue: string
  sections: SettingsNavSection[]
}>()

defineEmits<{
  'update:modelValue': [id: string]
}>()
</script>

<style scoped>
.snav-item-active {
  background: var(--green-pale);
  color: var(--green-brand);
  font-weight: 700;
}
.snav-item-active:hover { background: var(--green-pale); color: var(--green-brand); }
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .snav-item-active,
.dark .snav-item-active:hover {
  background: var(--bg-primary-soft);
  color: var(--green-light);
}
</style>
