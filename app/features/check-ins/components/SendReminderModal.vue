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
  "Hey {client_name}! 👋 Just a quick reminder to submit your weekly check-in when you get a chance. It only takes a few minutes and helps me give you the best support. 💪"
)
const sending     = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

watch(() => props.open, (open) => {
  if (!open) selected.value = new Set()
})

const selectedCount = computed(() => selected.value.size)
const allSelected   = computed(() =>
  props.clients.length > 0 && props.clients.every(c => selected.value.has(c.id))
)

const toggle = (id: string) => {
  const s = new Set(selected.value)
  s.has(id) ? s.delete(id) : s.add(id)
  selected.value = s
}

const toggleAll = () => {
  selected.value = allSelected.value ? new Set() : new Set(props.clients.map(c => c.id))
}

const preview = computed(() => {
  const name =
    props.clients.find(c => selected.value.has(c.id))?.name.split(' ')[0] ??
    props.clients[0]?.name.split(' ')[0] ??
    'Client'
  return message.value
    .replace(/\{client_name\}/g, name)
    .replace(/\{next_checkin_date\}/g, 'next Monday')
    .replace(/\{coach_name\}/g, 'Coach')
    .replace(/\{week_number\}/g, '14')
})

const insertVar = (v: string) => {
  const ta = textareaRef.value
  if (ta) {
    const start = ta.selectionStart
    const end   = ta.selectionEnd
    message.value = message.value.substring(0, start) + v + message.value.substring(end)
    nextTick(() => {
      if (ta) { ta.selectionStart = ta.selectionEnd = start + v.length; ta.focus() }
    })
  } else {
    message.value += v
  }
}

async function handleSend() {
  if (!selectedCount.value) return
  sending.value = true
  await new Promise(r => setTimeout(r, 1200))
  emit('sent', [...selected.value], message.value)
  emit('update:open', false)
  sending.value = false
}
</script>

<template>
  <UModal
    :open="open"
    title="Send Reminder"
    description="Nudge clients who haven't submitted their check-in yet"
    :ui="{ body: 'overflow-y-auto max-h-[65vh]' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div class="flex flex-col gap-4">

        <!-- Selector header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-[12px] font-semibold text-[#3D5A45] dark:text-(--text-secondary)">
              Select clients to remind
            </span>
            <span class="text-[11px] font-bold text-primary dark:text-(--green-light) bg-(--green-pale) dark:bg-(--bg-primary-soft) py-[2px] px-2 rounded-md">
              {{ selectedCount }} selected
            </span>
          </div>
          <UButton
            variant="ghost"
            color="primary"
            size="xs"
            class="text-[12px] font-semibold"
            @click="toggleAll"
          >{{ allSelected ? 'Deselect all' : 'Select all' }}</UButton>
        </div>

        <!-- Client list -->
        <div class="border-[1.5px] border-[#E5EDE8] dark:border-(--border) rounded-[10px] overflow-hidden max-h-[200px] overflow-y-auto">
          <div
            v-for="client in clients"
            :key="client.id"
            class="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer transition-colors border-b border-[#F0F4F1] dark:border-(--border) last:border-b-0"
            :class="selected.has(client.id)
              ? 'bg-[#F0F9F4] dark:bg-(--bg-primary-soft)'
              : 'bg-(--bg-surface) hover:bg-[#F7FAF8] dark:hover:bg-white/[.03]'"
            @click="toggle(client.id)"
          >
            <div
              class="w-4 h-4 rounded-[4px] border-[1.5px] shrink-0 flex items-center justify-center transition-all"
              :class="selected.has(client.id)
                ? 'bg-primary border-primary dark:bg-(--green-light) dark:border-(--green-light)'
                : 'border-[#D1E0D5] dark:border-(--border) bg-(--bg-surface)'"
            >
              <svg v-if="selected.has(client.id)" width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M1.5 4.5l2 2.5L7.5 2" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <Avatar :initials="client.initials" :variant="client.variant" :size="30" />
            <div class="flex-1 min-w-0">
              <div class="text-[13px] font-semibold text-(--text-primary)">{{ client.name }}</div>
              <div class="text-[11px] text-[#8FAD97] dark:text-(--text-muted)">
                {{ client.lastCheckIn ?? 'No check-in this week' }}
              </div>
            </div>
          </div>

          <div v-if="!clients.length" class="py-6 text-center text-[13px] text-[#8FAD97] dark:text-(--text-muted)">
            All clients have checked in this week 🎉
          </div>
        </div>

        <!-- Message composer -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[12px] font-bold text-[#3D5A45] dark:text-(--text-secondary)">Message</span>
            <span class="text-[11px] text-[#8FAD97] dark:text-(--text-muted)">Use variables to personalise</span>
          </div>
          <textarea
            ref="textareaRef"
            v-model="message"
            rows="3"
            class="w-full border-[1.5px] border-[#D1E0D5] dark:border-(--border) rounded-[10px] px-3 py-2.5 text-[13px] leading-[1.6] text-(--text-primary) bg-(--bg-surface) resize-none outline-none focus:border-(--green-brand) dark:focus:border-(--green-light) transition-colors min-h-[80px] font-[inherit]"
          />
          <div class="flex gap-1.5 flex-wrap mt-2">
            <UButton
              v-for="v in VARS"
              :key="v"
              variant="soft"
              color="primary"
              size="xs"
              class="text-[11px] font-semibold border border-[#A8D4BC] dark:border-(--green-light)/30 hover:bg-[#D1F0E0] dark:hover:bg-(--bg-primary-soft)/80"
              @click="insertVar(v)"
            >+ {{ v }}</UButton>
          </div>
        </div>

        <!-- Preview -->
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.8px] text-[#8FAD97] dark:text-(--text-muted) mb-1.5">
            Preview (as client will see it)
          </p>
          <div class="bg-[#F7FAF8] dark:bg-white/[.03] border-[1.5px] border-[#E5EDE8] dark:border-(--border) rounded-[10px] px-3.5 py-3 text-[13px] text-[#3D5A45] dark:text-(--text-secondary) leading-[1.6]">
            {{ preview }}
          </div>
          <div class="flex items-center gap-1 text-[12px] text-[#8FAD97] dark:text-(--text-muted) mt-2">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.2"/>
              <path d="M6 4v2.5M6 8v.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
            Reminders are sent via in-app notification and email
          </div>
        </div>

      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton variant="ghost" color="neutral" :disabled="sending" @click="emit('update:open', false)">
          Cancel
        </UButton>
        <UButton color="primary" :loading="sending" :disabled="!selectedCount" @click="handleSend">
          <svg v-if="!sending" width="13" height="13" viewBox="0 0 13 13" fill="none" class="shrink-0">
            <path d="M2 6.5h9M6.5 2l4.5 4.5L6.5 11" stroke="white" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Send to {{ selectedCount }} client{{ selectedCount !== 1 ? 's' : '' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
