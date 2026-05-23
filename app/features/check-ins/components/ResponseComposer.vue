<template>
  <div>
    <div class="section-label">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 2h8a1 1 0 011 1v5a1 1 0 01-1 1H4l-3 2V3a1 1 0 011-1z" stroke="var(--green-brand)" stroke-width="1.2" stroke-linejoin="round"/>
      </svg>
      Your Response
    </div>

    <div class="response-area">
      <!-- Native textarea retained — container uses focus-within for unified focus ring -->
      <textarea
        ref="textareaRef"
        :value="modelValue"
        class="response-textarea"
        :placeholder="placeholder"
        @input="onInput"
      ></textarea>
      <div class="response-footer">
        <div class="flex items-center gap-2.5">
          <div class="text-[11px] font-semibold text-[#8FAD97] dark:text-(--text-muted)">
            <span :style="{ color: charColor }">{{ modelValue.length }}</span> / {{ maxChars }} characters
          </div>
          <UButton
            variant="ghost"
            color="neutral"
            size="xs"
            class="gap-1 text-[#8FAD97] dark:text-(--text-muted) hover:text-primary dark:hover:text-(--green-light)"
            title="Use a response template"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
              <path d="M3 4h6M3 6h4M3 8h5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
            Templates
          </UButton>
        </div>

        <div class="flex gap-2">
          <UButton
            variant="outline"
            color="neutral"
            size="xs"
            class="hover:border-primary hover:text-primary hover:bg-[#F0F9F4] dark:hover:border-(--green-light) dark:hover:text-(--green-light) dark:hover:bg-(--bg-primary-soft)"
            @click="$emit('save-draft')"
          >Save Draft</UButton>
          <UButton
            color="primary"
            size="xs"
            :disabled="modelValue.length === 0 || props.sending"
            :loading="props.sending"
            @click="$emit('send')"
          >
            <svg v-if="!props.sending" width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1 6.5L12 1l-4.5 11L6 7.5l-5-1z" stroke="white" stroke-width="1.3" stroke-linejoin="round"/>
            </svg>
            {{ props.sending ? 'Sending…' : 'Send Response' }}
          </UButton>
        </div>
      </div>
    </div>

    <div class="mt-2.5 flex gap-[7px] flex-wrap items-center">
      <span class="text-[11px] font-semibold text-[#8FAD97] dark:text-(--text-muted)">Quick phrases:</span>
      <UButton
        v-for="phrase in quickPhrases"
        :key="phrase.label"
        variant="soft"
        color="primary"
        size="xs"
        class="text-[11px] font-semibold border-[1.5px] border-(--green-soft) dark:border-transparent"
        @click="appendPhrase(phrase.insert)"
      >{{ phrase.label }}</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string
  maxChars?: number
  placeholder?: string
  clientName?: string
  sending?: boolean
}>(), {
  maxChars: 500,
  placeholder: 'Write your coaching response…',
  sending: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: []
  'save-draft': []
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const quickPhrases = [
  { label: 'Great work this week!',      insert: 'Great work this week!' },
  { label: 'Keep it up 💪',               insert: "Keep it up, you're on track 💪" },
  { label: 'Push harder next week',       insert: "Let's push a bit harder next week." },
  { label: 'Proud of you!',               insert: "I'm proud of your consistency!" },
]

const onInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

const appendPhrase = (phrase: string) => {
  const cur = props.modelValue
  const sep = cur && !cur.endsWith(' ') ? ' ' : ''
  emit('update:modelValue', `${cur}${sep}${phrase} `)
  textareaRef.value?.focus()
}

const charColor = computed(() => {
  const n = props.modelValue.length
  if (n > props.maxChars * 0.9) return '#E74C3C'
  if (n > props.maxChars * 0.6) return '#E67E22'
  return 'var(--text-primary)'
})
</script>

<style scoped>
.section-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #8FAD97;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #E8F0EB;
}

.response-area {
  background: var(--bg-surface);
  border: 1.5px solid #E5EDE8;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color .15s, box-shadow .15s;
}
.response-area:focus-within {
  border-color: var(--green-brand);
  box-shadow: 0 0 0 3px rgba(26,122,74,.1);
}

.response-textarea {
  width: 100%;
  border: none;
  outline: none;
  resize: none;
  padding: 14px 16px;
  font-size: 14px;
  color: var(--text-primary);
  font-family: inherit;
  line-height: 1.65;
  background: transparent;
  min-height: 110px;
}
.response-textarea::placeholder { color: #A8BFB0; }

.response-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-top: 1px solid #F0F4F1;
  background: #FAFCFB;
}
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .section-label { color: var(--text-muted); }
.dark .section-label::after { background: var(--border); }
.dark .response-area { border-color: var(--border); }
.dark .response-textarea::placeholder { color: var(--text-muted); opacity: .55; }
.dark .response-footer { border-top-color: var(--border); background: rgba(255,255,255,.02); }
</style>
