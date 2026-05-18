<template>
  <div class="text-center py-[60px] px-10 bg-(--bg-surface) rounded-[14px] border border-(--border)">
    <svg class="w-12 h-12 mx-auto mb-3.5 text-[#C4CFC6] dark:text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <h3 class="text-[15px] font-bold text-[#374141] dark:text-(--text-primary) mb-1.5">Payout history coming soon</h3>
    <p class="text-[13px] text-(--text-muted)">Connect your Stripe account to see all payouts, transfer timelines, and bank deposits in one place.</p>
    <button type="button" class="mt-4 inline-flex items-center gap-1.5 bg-primary hover:bg-(--green-hover) text-white text-[13.5px] font-semibold py-2.5 px-4 rounded-lg cursor-pointer transition-colors">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/>
      </svg>
      Connect Stripe
    </button>
  </div>
</template>
