<script setup lang="ts">
defineProps<{
  clientName: string
}>()

const emit = defineEmits<{
  save: [text: string]
}>()

const text = ref('')
const saving = ref(false)

async function onSave() {
  const trimmed = text.value.trim()
  if (!trimmed) return
  saving.value = true
  try {
    emit('save', trimmed)
    text.value = ''
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-4">
    <div class="flex items-center gap-1 mb-2">
      <span class="rounded-md border border-(--text-primary) px-2 py-1 text-[11.5px] font-medium text-(--text-primary)">Note</span>
      <span class="rounded-md px-2 py-1 text-[11.5px] text-(--text-muted) cursor-not-allowed" aria-disabled="true">Message · soon</span>
      <span class="rounded-md px-2 py-1 text-[11.5px] text-(--text-muted) cursor-not-allowed" aria-disabled="true">Log session · soon</span>
    </div>
    <UTextarea
      v-model="text"
      :placeholder="`Add a private note about ${clientName}…`"
      :rows="2"
      autoresize
      class="w-full"
      variant="none"
      size="md"
    />
    <div class="flex items-center justify-between mt-1">
      <span class="text-[10.5px] text-(--text-muted)">Private · only you can see this</span>
      <UButton
        color="primary"
        size="sm"
        :loading="saving"
        :disabled="!text.trim()"
        @click="onSave"
      >
        Save note
      </UButton>
    </div>
  </div>
</template>
