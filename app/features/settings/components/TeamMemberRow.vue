<template>
  <div class="flex items-center gap-3.5 py-3.5 border-b border-(--border-muted) last:border-b-0">
    <Avatar :initials="initials" :variant="variant" :size="36" />
    <div class="min-w-0">
      <div class="text-[13.5px] font-semibold text-(--text-primary) truncate">{{ name }}</div>
      <div class="text-xs text-(--text-muted) truncate">{{ email }}</div>
    </div>
    <div
      class="ml-auto mr-3 text-[11.5px] font-semibold py-1 px-2.5 rounded-md"
      :class="isOwner ? 'bg-(--green-pale) text-primary dark:bg-(--bg-primary-soft) dark:text-(--green-light)' : 'bg-[#F3F4F6] dark:bg-white/5 text-[#374141] dark:text-(--text-secondary)'"
    >{{ role }}</div>
    <UButton
      variant="outline"
      color="neutral"
      size="sm"
      :class="{ 'opacity-40 pointer-events-none': disabled }"
      :disabled="disabled"
      @click="!disabled && $emit('menu')"
    >···</UButton>
  </div>
</template>

<script setup lang="ts">
import Avatar from '~/components/Avatar.vue'

withDefaults(defineProps<{
  initials: string
  variant?: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
  name: string
  email: string
  role: string
  isOwner?: boolean
  disabled?: boolean
}>(), {
  variant: 'a',
  isOwner: false,
  disabled: false,
})

defineEmits<{
  menu: []
}>()
</script>
