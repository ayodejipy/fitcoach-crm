<template>
  <div class="bg-(--bg-surface) rounded-[14px] border border-(--border) overflow-hidden">
    <table class="w-full border-collapse text-[13.5px]">
      <thead>
        <tr class="bg-[#F7FAF8] dark:bg-white/[.03] border-b-[1.5px] border-(--border)">
          <th class="th">Client</th>
          <th class="th">Plan</th>
          <th class="th">Amount</th>
          <th class="th">Next Billing</th>
          <th class="th">Status</th>
          <th class="th">Actions</th>
        </tr>
      </thead>
      <tbody>
        <SubscriptionRow v-for="s in subscriptions" :key="s.id" :subscription="s" />
      </tbody>
    </table>

    <Pagination
      :model-value="page"
      :pages="totalPages"
      :from="from"
      :to="to"
      :total="total"
      items-label="subscriptions"
      @update:model-value="$emit('update:page', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import SubscriptionRow, { type Subscription } from './SubscriptionRow.vue'
import Pagination from '~/components/Pagination.vue'

defineProps<{
  subscriptions: Subscription[]
  page: number
  totalPages: number
  from: number
  to: number
  total: number
}>()

defineEmits<{
  'update:page': [page: number]
}>()
</script>

<style scoped>
.th {
  text-align: left;
  padding: 11px 16px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: .5px;
  white-space: nowrap;
}
</style>
