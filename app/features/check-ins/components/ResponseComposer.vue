<template>
  <div>
    <div class="section-label">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 2h8a1 1 0 011 1v5a1 1 0 01-1 1H4l-3 2V3a1 1 0 011-1z" stroke="var(--green-brand)" stroke-width="1.2" stroke-linejoin="round"/>
      </svg>
      Your Response
    </div>

    <div class="response-area">
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
          <button type="button" class="inline-flex items-center gap-1 text-xs text-[#8FAD97] dark:text-(--text-muted) cursor-pointer hover:text-primary dark:hover:text-(--green-light) transition-colors" title="Use a response template">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
              <path d="M3 4h6M3 6h4M3 8h5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
            Templates
          </button>
        </div>

        <div class="flex gap-2">
          <button type="button" class="btn-draft" @click="$emit('save-draft')">Save Draft</button>
          <button
            type="button"
            class="btn-send"
            :disabled="modelValue.length === 0"
            @click="$emit('send')"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1 6.5L12 1l-4.5 11L6 7.5l-5-1z" stroke="white" stroke-width="1.3" stroke-linejoin="round"/>
            </svg>
            Send Response
          </button>
        </div>
      </div>
    </div>

    <div class="mt-2.5 flex gap-[7px] flex-wrap items-center">
      <span class="text-[11px] font-semibold text-[#8FAD97] dark:text-(--text-muted)">Quick phrases:</span>
      <button
        v-for="phrase in quickPhrases"
        :key="phrase.label"
        type="button"
        class="text-[11px] font-semibold bg-[#F0F9F4] dark:bg-(--bg-primary-soft) border-[1.5px] border-(--green-soft) dark:border-transparent rounded-md py-[3px] px-[9px] text-primary dark:text-(--green-light) cursor-pointer hover:bg-(--green-pale) transition-colors"
        @click="appendPhrase(phrase.insert)"
      >
        {{ phrase.label }}
      </button>
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
}>(), {
  maxChars: 500,
  placeholder: 'Write your coaching response…',
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

.btn-draft {
  background: transparent;
  border: 1.5px solid #D1E0D5;
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #3D5A45;
  cursor: pointer;
  transition: border-color .12s, background .12s, color .12s;
}
.btn-draft:hover { border-color: var(--green-brand); background: #F0F9F4; color: var(--green-brand); }

.btn-send {
  background: var(--green-brand);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background .15s, opacity .15s;
}
.btn-send:hover:not(:disabled) { background: var(--green-hover); }
.btn-send:disabled { opacity: .4; cursor: not-allowed; }
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .section-label { color: var(--text-muted); }
.dark .section-label::after { background: var(--border); }
.dark .response-area { border-color: var(--border); }
.dark .response-textarea::placeholder { color: var(--text-muted); opacity: .55; }
.dark .response-footer { border-top-color: var(--border); background: rgba(255,255,255,.02); }
.dark .btn-draft { border-color: var(--border); color: var(--text-secondary); }
.dark .btn-draft:hover { background: var(--bg-primary-soft); color: var(--green-light); }
</style>
