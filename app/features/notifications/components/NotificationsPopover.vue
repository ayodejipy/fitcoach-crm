<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import { fmtRelative } from '~/utils/format'
import { useNotificationsApi } from '~/features/notifications/composables/useNotificationsApi'
import { presentNotification, groupByRecency, type NotificationDisplay } from '~/features/notifications/utils/notification'

const api = useNotificationsApi()
const router = useRouter()
const toast = useToast()

const open = ref(false)
const unreadCount = ref(0)
const items = ref<NotificationDisplay[]>([])
const loading = ref(false)
const error = ref(false)

async function loadCount() {
  try {
    const result = await api.unreadCount()
    unreadCount.value = (result as { count?: number })?.count ?? 0
    error.value = false
  } catch {
    error.value = true
  }
}

async function loadList() {
  loading.value = true
  error.value = false
  try {
    const result = await api.list({ per_page: 20 })
    items.value = (result.notifications ?? []).map(presentNotification)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

watch(open, (next) => {
  if (next) loadList()
})

onMounted(() => {
  loadCount()
})

useIntervalFn(loadCount, 60_000)

const groups = computed(() => groupByRecency(items.value))

const hasUnread = computed(() => items.value.some(item => !item.isRead))

async function onItemClick(item: NotificationDisplay) {
  if (!item.isRead) {
    items.value = items.value.map(other => other.id === item.id ? { ...other, isRead: true } : other)
    unreadCount.value = Math.max(0, unreadCount.value - 1)
    api.markRead(item.id).catch(() => {})
  }
  open.value = false
  if (item.href) router.push(item.href)
}

async function onMarkAllRead() {
  const prevItems = items.value
  const prevCount = unreadCount.value
  items.value = items.value.map(item => ({ ...item, isRead: true }))
  unreadCount.value = 0
  try {
    await api.markAllRead()
    toast.add({ title: 'All notifications marked as read', color: 'success' })
  } catch {
    items.value = prevItems
    unreadCount.value = prevCount
    toast.add({ title: 'Could not mark as read', color: 'error' })
  }
}

const toneIconBg: Record<NotificationDisplay['tone'], string> = {
  success: 'bg-(--green-pale) text-(--green-brand)',
  info:    'bg-(--info-soft) text-(--info)',
  warning: 'bg-(--warning-soft) text-(--warning)',
  neutral: 'bg-(--bg-subtle) text-(--text-secondary)',
}

const badgeLabel = computed(() => unreadCount.value > 9 ? '9+' : String(unreadCount.value))
</script>

<template>
  <UPopover v-model:open="open" :ui="{ content: 'w-[360px]' }">
    <button
      type="button"
      class="relative inline-flex h-7 w-7 items-center justify-center rounded-md text-(--text-muted) hover:bg-(--bg-subtle) hover:text-(--text-primary) focus-visible:outline focus-visible:outline-2 focus-visible:outline-(--green-brand)/40 transition-colors"
      :aria-label="unreadCount > 0 ? `Notifications: ${unreadCount} unread` : 'Notifications'"
    >
      <UIcon name="i-hugeicons-notification-02" class="size-4" />
      <span
        v-if="unreadCount > 0"
        aria-hidden="true"
        class="absolute -top-0.5 -right-0.5 inline-flex h-3.5 min-w-[14px] px-[3px] items-center justify-center rounded-full bg-(--green-brand) text-[8.5px] font-bold tabular-nums text-white"
      >{{ badgeLabel }}</span>
    </button>

    <template #content>
      <div class="flex flex-col max-h-[480px]">
        <header class="flex items-center justify-between px-4 h-[44px] border-b border-(--border) shrink-0">
          <div class="flex items-baseline gap-2">
            <h2 class="text-[13px] font-semibold text-(--text-primary)">Notifications</h2>
            <span v-if="unreadCount" class="text-[11px] text-(--text-muted) tabular-nums">· {{ unreadCount }} unread</span>
          </div>
          <UButton
            v-if="hasUnread"
            variant="ghost"
            color="primary"
            size="xs"
            @click="onMarkAllRead"
          >
            Mark all read
          </UButton>
        </header>

        <div class="flex-1 overflow-y-auto">
          <div v-if="loading" class="px-4 py-6 text-center text-[12px] text-(--text-muted)">
            Loading…
          </div>

          <div v-else-if="error" class="px-4 py-6 text-center">
            <UIcon name="i-hugeicons-alert-02" class="size-5 text-(--warning) mb-1.5 inline-block" />
            <p class="text-[12.5px] text-(--text-secondary)">Couldn't load notifications.</p>
            <UButton variant="ghost" color="primary" size="xs" class="mt-1" @click="loadList">Retry</UButton>
          </div>

          <div v-else-if="!items.length" class="px-4 py-8 text-center">
            <UIcon name="i-hugeicons-checkmark-circle-02" class="size-7 text-(--green-brand) mb-2 inline-block" />
            <p class="text-[13px] font-semibold text-(--text-primary)">All caught up</p>
            <p class="mt-0.5 text-[11.5px] text-(--text-muted)">You'll be notified when there's something new.</p>
          </div>

          <template v-else>
            <div v-for="group in groups" :key="group.label">
              <div class="px-4 py-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-(--text-secondary) bg-(--bg-subtle)/60 border-b border-(--border-muted)">
                {{ group.label }}
              </div>
              <button
                v-for="item in group.items"
                :key="item.id"
                type="button"
                class="w-full flex items-start gap-3 px-4 py-2.5 text-left border-b border-(--border-muted) last:border-b-0 transition-colors hover:bg-(--bg-subtle)/60"
                :class="!item.isRead ? 'bg-(--green-pale)/30' : 'bg-(--bg-surface)'"
                @click="onItemClick(item)"
              >
                <span
                  class="inline-flex items-center justify-center size-7 rounded-md shrink-0 mt-0.5"
                  :class="toneIconBg[item.tone]"
                >
                  <UIcon :name="item.icon" class="size-3.5" />
                </span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-baseline justify-between gap-2">
                    <span
                      class="text-[12.5px] truncate"
                      :class="item.isRead ? 'font-medium text-(--text-secondary)' : 'font-semibold text-(--text-primary)'"
                    >{{ item.title }}</span>
                    <span class="text-[10.5px] text-(--text-muted) tabular-nums shrink-0">{{ fmtRelative(item.createdAt) }}</span>
                  </div>
                  <p v-if="item.description" class="mt-0.5 text-[11px] text-(--text-muted) truncate">{{ item.description }}</p>
                </div>
                <span
                  v-if="!item.isRead"
                  aria-hidden="true"
                  class="size-1.5 rounded-full bg-(--green-brand) shrink-0 mt-2"
                />
              </button>
            </div>
          </template>
        </div>
      </div>
    </template>
  </UPopover>
</template>
