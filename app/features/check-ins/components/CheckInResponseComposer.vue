<script setup lang="ts">
const props = defineProps<{
  clientName: string
  initialDraft?: string
  sending?: boolean
}>()

const emit = defineEmits<{
  send: [text: string]
  saveDraft: [text: string]
}>()

const text = ref(props.initialDraft ?? '')

watch(() => props.initialDraft, (val) => {
  if (val != null && text.value === '') text.value = val
})

const charCount = computed(() => text.value.length)

function onSend() {
  const trimmed = text.value.trim()
  if (!trimmed || props.sending) return
  emit('send', trimmed)
}

function onSaveDraft() {
  emit('saveDraft', text.value)
}

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault()
    onSend()
  }
}
</script>

<template>
  <div class="border-t border-(--border-muted)">
    <div class="flex items-center gap-2.5 px-5 pt-4">
      <span
        aria-hidden="true"
        class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-(--green-brand) text-[10.5px] font-semibold text-white"
      >
        You
      </span>
      <span class="text-[12.5px] font-semibold text-(--text-primary)">Your response</span>
      <span class="text-[11px] text-(--text-muted)">· will be visible to {{ clientName }}</span>
    </div>
    <textarea
      v-model="text"
      placeholder="Write your coaching response… (⌘+Enter to send)"
      rows="4"
      class="w-full px-5 py-3 text-[13.5px] bg-transparent text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none resize-none"
      :aria-label="`Response to ${clientName}`"
      @keydown="onKeydown"
    />
    <div class="flex items-center justify-between border-t border-(--border-muted) bg-(--bg-subtle) px-5 py-2.5">
      <div class="flex items-center gap-3 text-[11.5px]">
        <span class="text-(--text-muted) tabular-nums">{{ charCount }} / 500</span>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          :disabled="!text.length || sending"
          @click="onSaveDraft"
        >
          Save draft
        </UButton>
        <UButton
          color="primary"
          size="sm"
          :loading="sending"
          :disabled="!text.trim()"
          @click="onSend"
        >
          Send response →
        </UButton>
      </div>
    </div>
  </div>
</template>
