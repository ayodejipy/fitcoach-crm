<script setup lang="ts">
withDefaults(defineProps<{
  showBack?: boolean
  continueLabel?: string
  loading?: boolean
}>(), {
  showBack: false,
  continueLabel: 'Continue',
  loading: false,
})

defineEmits<{
  back: []
  continue: []
}>()
</script>

<template>
  <footer class="px-10 py-4 border-t border-(--border) bg-(--bg-surface) flex items-center justify-between max-md:px-5">
    <UButton
      color="neutral"
      variant="outline"
      size="md"
      icon="i-lucide-chevron-left"
      :disabled="!showBack"
      @click="$emit('back')"
    >
      Back
    </UButton>
    <UButton
      color="primary"
      size="md"
      trailing-icon="i-lucide-chevron-right"
      :loading="loading"
      @click="$emit('continue')"
    >
      {{ continueLabel }}
    </UButton>
  </footer>
</template>
