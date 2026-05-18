<template>
  <div>
    <div class="mb-7">
      <div class="text-xl font-extrabold text-(--text-primary) tracking-[-0.3px]">Billing</div>
      <div class="text-[13.5px] text-(--text-muted) mt-1">Manage your FitCoach subscription and payment method.</div>
    </div>

    <!-- Current plan -->
    <div class="plan-card flex items-center gap-[18px] mb-5">
      <div class="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-base font-extrabold text-(--text-primary)">Growth Plan</div>
        <div class="text-[13px] text-[#4B5563] dark:text-(--text-secondary) mt-0.5">$49 / month · renews May 1, 2026</div>
      </div>
      <div class="bg-primary text-white text-[11.5px] font-bold py-1 px-3 rounded-[20px]">Active</div>
    </div>

    <!-- Payment method -->
    <SettingsCard title="Payment Method">
      <div class="flex items-center gap-3.5 py-3.5 border-b border-(--border-muted)">
        <div class="w-11 h-[30px] bg-[#1A1F71] rounded-md flex items-center justify-center">
          <svg viewBox="0 0 32 20" width="28" height="18">
            <rect width="32" height="20" rx="3" fill="#1A1F71"/>
            <text x="4" y="14" font-size="9" font-weight="800" fill="#fff" font-family="Arial">VISA</text>
          </svg>
        </div>
        <div>
          <div class="text-[13.5px] font-semibold text-(--text-primary)">Visa ending in 4242</div>
          <div class="text-xs text-(--text-muted)">Expires 08 / 2028</div>
        </div>
        <button type="button" class="btn-ghost ml-auto">Replace</button>
      </div>
      <div class="pt-3.5">
        <button type="button" class="btn-ghost">
          <svg class="w-[13px] h-[13px]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
          </svg>
          Add Payment Method
        </button>
      </div>
    </SettingsCard>

    <!-- Invoice history -->
    <SettingsCard title="Invoice History" body-padding="p-0">
      <table class="w-full border-collapse text-[13.5px]">
        <thead class="bg-[#F8FAF9] dark:bg-white/[.03]">
          <tr>
            <th class="invoice-th">Date</th>
            <th class="invoice-th">Plan</th>
            <th class="invoice-th">Amount</th>
            <th class="invoice-th">Receipt</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, idx) in invoices"
            :key="row.date"
            :class="{ 'border-b border-(--border-muted)': idx < invoices.length - 1 }"
          >
            <td class="invoice-td text-[#374141] dark:text-(--text-secondary)">{{ row.date }}</td>
            <td class="invoice-td text-[#374141] dark:text-(--text-secondary)">{{ row.plan }}</td>
            <td class="invoice-td font-bold text-(--text-primary)">{{ row.amount }}</td>
            <td class="invoice-td">
              <a href="#" class="text-primary dark:text-(--green-light) font-semibold text-[13px] no-underline hover:underline">Download</a>
            </td>
          </tr>
        </tbody>
      </table>
    </SettingsCard>
  </div>
</template>

<script setup lang="ts">
import SettingsCard from './SettingsCard.vue'

const invoices = [
  { date: 'Apr 1, 2026', plan: 'Growth Plan', amount: '$49.00' },
  { date: 'Mar 1, 2026', plan: 'Growth Plan', amount: '$49.00' },
  { date: 'Feb 1, 2026', plan: 'Growth Plan', amount: '$49.00' },
]
</script>

<style scoped>
.plan-card {
  background: var(--green-ghost, #F0F7F3);
  border: 1.5px solid #B8D9C4;
  border-radius: 14px;
  padding: 22px 24px;
}

.invoice-th {
  text-align: left;
  padding: 10px 16px;
  font-size: 11.5px;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .4px;
  border-bottom: 1px solid var(--border);
}
.invoice-td {
  padding: 12px 16px;
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  font-size: 12.5px;
  border-radius: 7px;
  font-weight: 600;
  color: #374141;
  background: #fff;
  border: 1.5px solid #D8DFD9;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: background .15s, border-color .15s;
}
.btn-ghost:hover { background: #F5F7F5; border-color: #B8C4BB; }
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .plan-card { background: rgba(46,204,113,.08); border-color: rgba(46,204,113,.25); }

.dark .btn-ghost { background: var(--bg-surface); color: var(--text-secondary); border-color: var(--border); }
.dark .btn-ghost:hover { background: rgba(255,255,255,.04); border-color: var(--border-strong); }
</style>
