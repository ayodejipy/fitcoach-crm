<template>
  <div class="flex flex-col items-center pt-7 pb-5 border-b border-(--border-muted) mb-7">
    <div class="relative cursor-pointer group" @click="$emit('change')">
      <div class="avatar-img w-24 h-24 rounded-full flex items-center justify-center text-[32px] font-extrabold text-white tracking-[-1px] border-[3px] border-white transition-[filter] group-hover:brightness-90">
        {{ initials }}
      </div>
      <div class="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary border-2 border-white flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,.2)]">
        <svg class="w-[13px] h-[13px] text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
        </svg>
      </div>
    </div>
    <div
      class="mt-2.5 text-[12.5px] font-semibold text-primary dark:text-(--green-light) cursor-pointer hover:underline"
      @click="$emit('change')"
    >Change Photo</div>
    <div class="text-[11.5px] text-(--text-muted) mt-1">{{ hint }}</div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  initials: string
  hint?: string
}>(), {
  hint: 'JPG, PNG or WebP · Max 5MB',
})

defineEmits<{
  change: []
}>()
</script>

<style scoped>
.avatar-img {
  background: linear-gradient(135deg, #1A7A4A, #2ECC71);
  box-shadow: 0 0 0 2px #D4E8DA, 0 4px 16px rgba(0,0,0,.12);
}
</style>
