<template>
  <div class="text-center py-[60px] px-10 bg-(--bg-surface) rounded-[14px] border border-(--border)">
    <svg class="w-12 h-12 mx-auto mb-3.5 text-[#C4CFC6] dark:text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <h3 class="text-[15px] font-bold text-[#374141] dark:text-(--text-primary) mb-1.5">Payout history coming soon</h3>
    <p class="text-[13px] text-(--text-muted)">Connect your Stripe account to see all payouts, transfer timelines, and bank deposits in one place.</p>
    <UButton color="primary" leading-icon="i-heroicons-link" class="mt-4">
      Connect Stripe
    </UButton>
  </div>
</template>
