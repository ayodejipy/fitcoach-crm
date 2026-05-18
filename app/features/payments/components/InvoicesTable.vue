<template>
  <div class="bg-(--bg-surface) rounded-xl border border-(--border) overflow-hidden">
    <table class="w-full border-collapse text-[13.5px]">
      <thead>
        <tr class="bg-[#F7FAF8] dark:bg-white/3 border-b-[1.5px] border-(--border)">
          <th class="th">Invoice #</th>
          <th class="th">Client</th>
          <th class="th">Description</th>
          <th class="th">Amount</th>
          <th class="th">Sent Date</th>
          <th class="th">Due Date</th>
          <th class="th">Status</th>
          <th class="th">Actions</th>
        </tr>
      </thead>
      <tbody>
        <InvoiceRow v-for="i in invoices" :key="i.id" :invoice="i" />
      </tbody>
    </table>

    <Pagination
      :model-value="page"
      :pages="totalPages"
      :from="from"
      :to="to"
      :total="total"
      items-label="invoices"
      @update:model-value="$emit('update:page', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import InvoiceRow, { type Invoice } from './InvoiceRow.vue'
import Pagination from '~/components/Pagination.vue'

defineProps<{
  invoices: Invoice[]
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
