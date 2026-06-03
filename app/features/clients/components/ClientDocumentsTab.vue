<script setup lang="ts">
defineProps<{
  clientName: string
}>()
</script>

<template>
  <div class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-10 text-center">
    <UIcon name="i-lucide-folder" class="size-8 text-(--text-muted) mb-3 inline-block" />
    <h2 class="text-[14.5px] font-semibold text-(--text-primary)">Documents coming soon</h2>
    <p class="mt-1.5 text-[12.5px] text-(--text-secondary) max-w-[420px] mx-auto">
      Upload PARQ forms, progress photos consent, training plans, and other files for {{ clientName }}.
      We're building this — it'll land in a coming release.
    </p>
    <UButton color="neutral" variant="outline" size="sm" class="mt-4" disabled icon="i-lucide-upload">
      Upload document
    </UButton>
  </div>
</template>
