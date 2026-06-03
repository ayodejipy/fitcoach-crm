<script setup lang="ts">
import Avatar from '~/components/Avatar.vue'
import EmptyState from '~/components/EmptyState.vue'
import type { AvatarVariant } from '~/utils/client'

type ClientStatus = 'active' | 'paused' | 'new' | 'ended'

defineProps<{
  clients: Array<{
    id?: string
    initials: string
    variant: AvatarVariant
    name: string
    email: string
    goal: string
    lastCheckIn: string
    lastCheckInOverdue?: boolean
    status: ClientStatus
  }>
  totalClients: number
}>()

const statusLabel = (status: ClientStatus) => ({
  active: 'Active',
  paused: 'Paused',
  new: 'New',
  ended: 'Ended',
}[status])

const statusDot = (status: ClientStatus) => ({
  active: 'bg-(--green-brand)',
  paused: 'bg-(--warning)',
  new: 'bg-(--info)',
  ended: 'bg-(--text-muted)',
}[status])
</script>

<template>
  <section
    aria-labelledby="clients-preview-heading"
    class="rounded-[10px] border border-(--border) bg-(--bg-surface) overflow-hidden"
  >
    <header class="flex items-center justify-between border-b border-(--border) px-5 py-3">
      <h3 id="clients-preview-heading" class="text-[13.5px] font-semibold text-(--text-primary)">
        All clients
      </h3>
      <NuxtLink
        to="/clients"
        class="text-[11.5px] text-(--text-secondary) hover:text-(--text-primary) no-underline"
      >
        View all {{ totalClients }} →
      </NuxtLink>
    </header>

    <table v-if="clients.length" class="w-full text-[12.5px]">
      <thead>
        <tr class="border-b border-(--border) bg-(--bg-subtle) text-[10.5px] font-medium uppercase tracking-wide text-(--text-muted)">
          <th scope="col" class="text-left px-5 py-2 font-medium">Client</th>
          <th scope="col" class="text-left px-5 py-2 font-medium">Goal</th>
          <th scope="col" class="text-left px-5 py-2 font-medium">Last check-in</th>
          <th scope="col" class="text-left px-5 py-2 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(client, idx) in clients"
          :key="client.id ?? client.email"
          class="hover:bg-(--bg-subtle)"
          :class="idx < clients.length - 1 ? 'border-b border-(--border-muted)' : ''"
        >
          <td class="px-5 py-3">
            <NuxtLink
              :to="`/clients/${client.id}`"
              class="flex items-center gap-2.5 no-underline text-(--text-primary)"
            >
              <Avatar :initials="client.initials" :variant="client.variant" :size="28" />
              <div class="min-w-0">
                <div class="font-semibold truncate">{{ client.name }}</div>
                <div class="text-[10.5px] text-(--text-muted) truncate">{{ client.email }}</div>
              </div>
            </NuxtLink>
          </td>
          <td class="px-5 py-3 text-(--text-secondary)">{{ client.goal }}</td>
          <td class="px-5 py-3" :class="client.lastCheckInOverdue ? 'text-(--red) font-medium' : 'text-(--text-secondary)'">
            {{ client.lastCheckIn }}
          </td>
          <td class="px-5 py-3">
            <span class="inline-flex items-center gap-1.5 text-[11.5px] text-(--text-secondary)">
              <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full" :class="statusDot(client.status)" />
              {{ statusLabel(client.status) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <EmptyState
      v-else
      icon="i-lucide-users"
      headline="Add your first client"
      hint="Your client roster is empty. Invite a client to start tracking their progress."
      cta="Add client"
      cta-to="/clients"
    />
  </section>
</template>
