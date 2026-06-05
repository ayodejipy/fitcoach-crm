<script setup lang="ts">
import Avatar from '~/components/Avatar.vue'

export interface ReminderClient {
  id: string
  name: string
  initials: string
  variant: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
  lastCheckIn?: string
}

const props = defineProps<{
  open: boolean
  clients: ReminderClient[]
}>()

const emit = defineEmits<{
  'update:open': [val: boolean]
  sent: [clientIds: string[], message: string]
}>()

const VARS = ['{client_name}', '{next_checkin_date}', '{coach_name}', '{week_number}']

const selected = ref(new Set<string>())
const message = ref(
  "Hey {client_name}! Just a quick reminder to submit your weekly check-in when you get a chance. It only takes a few minutes and helps me give you the best support.",
)
const sending = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

watch(() => props.open, (open) => {
  if (!open) selected.value = new Set()
})

const selectedCount = computed(() => selected.value.size)
const allSelected = computed(() =>
  props.clients.length > 0 && props.clients.every(client => selected.value.has(client.id)),
)

function toggle(id: string) {
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selected.value = next
}

function toggleAll() {
  selected.value = allSelected.value ? new Set() : new Set(props.clients.map(client => client.id))
}

const preview = computed(() => {
  const name =
    props.clients.find(client => selected.value.has(client.id))?.name.split(' ')[0]
    ?? props.clients[0]?.name.split(' ')[0]
    ?? 'Client'
  return message.value
    .replace(/\{client_name\}/g, name)
    .replace(/\{next_checkin_date\}/g, 'next Monday')
    .replace(/\{coach_name\}/g, 'Coach')
    .replace(/\{week_number\}/g, '14')
})

function insertVar(variable: string) {
  const ta = textareaRef.value
  if (!ta) {
    message.value += variable
    return
  }
  const start = ta.selectionStart
  const end = ta.selectionEnd
  message.value = message.value.substring(0, start) + variable + message.value.substring(end)
  nextTick(() => {
    ta.selectionStart = ta.selectionEnd = start + variable.length
    ta.focus()
  })
}

async function handleSend() {
  if (!selectedCount.value) return
  sending.value = true
  await new Promise(resolve => setTimeout(resolve, 1200))
  emit('sent', [...selected.value], message.value)
  emit('update:open', false)
  sending.value = false
}
</script>

<template>
  <UModal
    :open="open"
    title="Send reminder"
    description="Nudge clients who haven't submitted their check-in yet."
    :ui="{ body: 'p-5 space-y-4', footer: 'p-4' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <section aria-labelledby="reminder-clients-heading">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <h3 id="reminder-clients-heading" class="text-[12px] font-semibold text-(--text-secondary)">Select clients</h3>
            <UBadge
              v-if="selectedCount"
              :label="`${selectedCount} selected`"
              color="success"
              variant="soft"
              size="sm"
            />
          </div>
          <UButton
            v-if="clients.length"
            variant="ghost"
            color="primary"
            size="xs"
            @click="toggleAll"
          >
            {{ allSelected ? 'Deselect all' : 'Select all' }}
          </UButton>
        </div>

        <div class="rounded-md border border-(--border) overflow-hidden max-h-[200px] overflow-y-auto">
          <button
            v-for="client in clients"
            :key="client.id"
            type="button"
            class="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left border-b border-(--border-muted) last:border-b-0 transition-colors"
            :class="selected.has(client.id)
              ? 'bg-(--green-pale)'
              : 'bg-(--bg-surface) hover:bg-(--bg-subtle)'"
            @click="toggle(client.id)"
          >
            <span
              aria-hidden="true"
              class="w-4 h-4 rounded-sm border-[1.5px] shrink-0 flex items-center justify-center transition-colors"
              :class="selected.has(client.id)
                ? 'bg-(--green-brand) border-(--green-brand)'
                : 'border-(--border-strong) bg-(--bg-surface)'"
            >
              <UIcon v-if="selected.has(client.id)" name="i-lucide-check" class="size-3 text-white" />
            </span>
            <Avatar :initials="client.initials" :variant="client.variant" :size="28" />
            <div class="flex-1 min-w-0">
              <div class="text-[13px] font-semibold text-(--text-primary) truncate">{{ client.name }}</div>
              <div class="text-[11px] text-(--text-muted) truncate">{{ client.lastCheckIn ?? 'No check-in this week' }}</div>
            </div>
          </button>

          <div v-if="!clients.length" class="py-6 text-center text-[12.5px] text-(--text-muted)">
            All clients have checked in this week.
          </div>
        </div>
      </section>

      <section aria-labelledby="reminder-message-heading">
        <div class="flex items-center justify-between mb-1.5">
          <h3 id="reminder-message-heading" class="text-[12px] font-semibold text-(--text-secondary)">Message</h3>
          <span class="text-[11px] text-(--text-muted)">Use variables to personalise</span>
        </div>
        <textarea
          ref="textareaRef"
          v-model="message"
          rows="3"
          aria-label="Reminder message"
          class="w-full rounded-md border border-(--border) bg-(--bg-surface) px-3 py-2.5 text-[13px] leading-relaxed text-(--text-primary) resize-none focus:border-(--green-brand) focus:ring-3 focus:ring-(--green-brand)/15 focus:outline-none transition-colors min-h-[80px]"
        />
        <div class="flex gap-1.5 flex-wrap mt-2">
          <UButton
            v-for="variable in VARS"
            :key="variable"
            variant="soft"
            color="success"
            size="xs"
            @click="insertVar(variable)"
          >
            + {{ variable }}
          </UButton>
        </div>
      </section>

      <section aria-labelledby="reminder-preview-heading">
        <h3 id="reminder-preview-heading" class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted) mb-1.5">
          Preview (as client will see it)
        </h3>
        <div class="rounded-md border border-(--border) bg-(--bg-subtle)/60 px-3.5 py-3 text-[12.5px] text-(--text-secondary) leading-relaxed">
          {{ preview }}
        </div>
        <p class="flex items-center gap-1.5 text-[11px] text-(--text-muted) mt-2">
          <UIcon name="i-hugeicons-information-circle" class="size-3" />
          Reminders are sent via in-app notification and email.
        </p>
      </section>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton variant="ghost" color="neutral" :disabled="sending" @click="emit('update:open', false)">
          Cancel
        </UButton>
        <UButton
          color="primary"
          :loading="sending"
          :disabled="!selectedCount"
          :trailing-icon="sending ? undefined : 'i-hugeicons-sent'"
          @click="handleSend"
        >
          Send to {{ selectedCount }} client{{ selectedCount !== 1 ? 's' : '' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
