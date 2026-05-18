<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-black/35 z-[400]"
        @click="$emit('update:modelValue', false)"
      />
    </Transition>

    <Transition name="drawer">
      <aside
        v-if="modelValue"
        class="fixed top-0 right-0 bottom-0 w-[420px] max-w-full bg-(--bg-surface) shadow-[-8px_0_40px_rgba(0,0,0,0.18)] z-[500] flex flex-col"
      >
        <header class="py-5 px-6 border-b border-(--border) flex items-center gap-3">
          <div class="text-base font-bold text-(--text-primary) flex-1">Create Invoice</div>
          <button type="button" class="drawer-close" @click="$emit('update:modelValue', false)">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </header>

        <div class="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-5">
          <div class="flex flex-col gap-[7px]">
            <label class="form-label">Select Client <span class="text-[#DC2626] ml-0.5">*</span></label>
            <div class="relative">
              <select v-model="form.client" class="form-select">
                <option value="" disabled>Choose a client…</option>
                <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col gap-[7px]">
            <label class="form-label">Description <span class="text-[#DC2626] ml-0.5">*</span></label>
            <input v-model="form.description" type="text" class="form-input" placeholder="e.g. May coaching fee, nutrition plan add-on…">
          </div>

          <div class="flex flex-col gap-[7px]">
            <label class="form-label">Amount <span class="text-[#DC2626] ml-0.5">*</span></label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-(--text-muted)">$</span>
              <input v-model.number="form.amount" type="number" min="0" step="0.01" class="form-input pl-[26px]" placeholder="0.00">
            </div>
          </div>

          <div class="flex flex-col gap-[7px]">
            <label class="form-label">Due Date <span class="text-[#DC2626] ml-0.5">*</span></label>
            <input v-model="form.dueDate" type="date" class="form-input">
          </div>

          <div class="flex items-center justify-between py-3.5 px-4 bg-[#F0F7F3] dark:bg-(--bg-primary-soft) rounded-[10px] border border-[#D4E8DA] dark:border-(--border)">
            <div>
              <div class="text-[13.5px] font-semibold text-(--text-primary)">Send to Client</div>
              <div class="text-xs text-(--text-muted) mt-0.5">Email invoice immediately after creating</div>
            </div>
            <label class="relative inline-block w-[42px] h-6 shrink-0 cursor-pointer">
              <input v-model="form.sendToClient" type="checkbox" class="peer sr-only">
              <span class="absolute inset-0 bg-[#CBD5E1] dark:bg-white/20 rounded-xl transition-colors peer-checked:bg-primary"></span>
              <span class="absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform peer-checked:translate-x-[18px]"></span>
            </label>
          </div>

          <div class="bg-[#F0F7F3] dark:bg-(--bg-primary-soft) rounded-[10px] border border-dashed border-[#B0D4BC] dark:border-(--border) p-4">
            <div class="text-xs font-bold uppercase tracking-[0.5px] text-(--text-muted) mb-2.5">Invoice Preview</div>
            <div class="flex justify-between text-[13px] py-[3px]">
              <span class="text-(--text-muted)">Client</span>
              <span class="font-semibold text-[#374141] dark:text-(--text-primary)">{{ previewClient }}</span>
            </div>
            <div class="flex justify-between text-[13px] py-[3px]">
              <span class="text-(--text-muted)">Description</span>
              <span class="font-semibold text-[#374141] dark:text-(--text-primary) max-w-[180px] text-right overflow-hidden text-ellipsis whitespace-nowrap">{{ form.description || '—' }}</span>
            </div>
            <div class="flex justify-between text-[13px] py-[3px]">
              <span class="text-(--text-muted)">Due Date</span>
              <span class="font-semibold text-[#374141] dark:text-(--text-primary)">{{ previewDueDate }}</span>
            </div>
            <div class="flex justify-between text-sm py-[3px] font-bold text-(--text-primary) border-t border-[#C8DED0] dark:border-(--border) mt-1.5 pt-2.5">
              <span>Total Due</span>
              <span>{{ previewAmount }}</span>
            </div>
          </div>
        </div>

        <div class="py-4 px-6 border-t border-(--border) flex gap-2.5">
          <button type="button" class="flex-1 justify-center py-2.5 px-4 rounded-lg border border-(--border) bg-(--bg-surface) text-[13.5px] font-semibold text-(--text-secondary) cursor-pointer hover:bg-[#F5F7F5] dark:hover:bg-white/5 transition-colors" @click="$emit('update:modelValue', false)">
            Cancel
          </button>
          <button type="button" class="flex-1 justify-center flex items-center gap-1.5 py-2.5 px-4 rounded-lg bg-primary hover:bg-(--green-hover) text-white text-[13.5px] font-semibold cursor-pointer transition-colors" @click="submit">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
            Create &amp; Send
          </button>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'

export interface InvoiceClientOption {
  id: string
  name: string
}

export interface InvoicePayload {
  client: string
  description: string
  amount: number | null
  dueDate: string
  sendToClient: boolean
}

const props = defineProps<{
  modelValue: boolean
  clients: InvoiceClientOption[]
  defaultDueDate?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  submit: [payload: InvoicePayload]
}>()

const makeForm = (): InvoicePayload => ({
  client: '',
  description: '',
  amount: null,
  dueDate: props.defaultDueDate ?? '',
  sendToClient: true,
})

const form = reactive<InvoicePayload>(makeForm())

watch(() => props.modelValue, (open) => {
  if (open) Object.assign(form, makeForm())
})

const previewClient = computed(() => props.clients.find((c) => c.id === form.client)?.name ?? '—')

const previewAmount = computed(() => {
  const n = typeof form.amount === 'number' ? form.amount : Number(form.amount)
  return Number.isFinite(n) && n > 0 ? `$${n.toFixed(2)}` : '—'
})

const previewDueDate = computed(() => {
  if (!form.dueDate) return '—'
  const d = new Date(form.dueDate + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
})

const submit = () => {
  if (!form.client || !form.amount) return
  emit('submit', { ...form })
  emit('update:modelValue', false)
}
</script>

<style scoped>
.drawer-close {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; border: 1px solid var(--border);
  background: var(--bg-surface); color: var(--text-muted);
  transition: background .12s;
}
.drawer-close:hover { background: #F5F7F5; }

.form-label {
  font-size: 12.5px;
  font-weight: 700;
  color: #374141;
  letter-spacing: .2px;
}

.form-input, .form-select {
  width: 100%;
  padding: 10px 13px;
  border: 1.5px solid var(--border);
  border-radius: 9px;
  font-size: 13.5px;
  color: var(--text-primary);
  font-family: inherit;
  background: var(--bg-surface);
  outline: none;
  transition: border-color .15s, box-shadow .15s;
  appearance: none;
}
.form-input:focus, .form-select:focus {
  border-color: var(--green-brand);
  box-shadow: 0 0 0 3px rgba(26,122,74,.12);
}
.form-select {
  padding-right: 36px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 13px center;
}

/* Transitions */
.overlay-enter-active, .overlay-leave-active { transition: opacity .25s; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

.drawer-enter-active, .drawer-leave-active { transition: transform .28s cubic-bezier(.22,1,.36,1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .drawer-close:hover { background: rgba(255,255,255,.05); }
.dark .form-label { color: var(--text-secondary); }
.dark .form-input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
</style>
