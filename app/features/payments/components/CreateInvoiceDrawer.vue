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
          <UButton
            variant="outline"
            color="neutral"
            class="size-8 p-0 justify-center"
            aria-label="Close"
            @click="$emit('update:modelValue', false)"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </UButton>
        </header>

        <div class="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-5">
          <UFormField label="Select Client" name="client" required>
            <USelect
              v-model="form.client"
              :items="clients"
              value-key="id"
              label-key="name"
              placeholder="Choose a client…"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Description" name="description" required>
            <UInput
              v-model="form.description"
              placeholder="e.g. May coaching fee, nutrition plan add-on…"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Amount" name="amount" required>
            <UInput
              v-model.number="form.amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="w-full"
            >
              <template #leading>
                <span class="text-(--text-muted) text-sm font-semibold">$</span>
              </template>
            </UInput>
          </UFormField>

          <UFormField label="Due Date" name="dueDate" required>
            <UInput v-model="form.dueDate" type="date" class="w-full" />
          </UFormField>

          <div class="flex items-center justify-between py-3.5 px-4 bg-[#F0F7F3] dark:bg-(--bg-primary-soft) rounded-[10px] border border-[#D4E8DA] dark:border-(--border)">
            <div>
              <div class="text-[13.5px] font-semibold text-(--text-primary)">Send to Client</div>
              <div class="text-xs text-(--text-muted) mt-0.5">Email invoice immediately after creating</div>
            </div>
            <UToggle v-model="form.sendToClient" color="primary" />
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
          <UButton
            variant="outline"
            color="neutral"
            size="lg"
            class="flex-1 justify-center"
            @click="$emit('update:modelValue', false)"
          >Cancel</UButton>
          <UButton
            color="primary"
            size="lg"
            class="flex-1 justify-center"
            leading-icon="i-heroicons-envelope"
            @click="submit"
          >Create &amp; Send</UButton>
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
/* Drawer and overlay transitions */
.overlay-enter-active, .overlay-leave-active { transition: opacity .25s; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

.drawer-enter-active, .drawer-leave-active { transition: transform .28s cubic-bezier(.22,1,.36,1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }
</style>
