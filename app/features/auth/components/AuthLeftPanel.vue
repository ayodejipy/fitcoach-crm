<script setup lang="ts">
const VALUE_PROPS = [
  { label: 'Client check-ins', text: 'collected automatically every week' },
  { label: 'Sessions, payments, and progress', text: 'in a single dashboard' },
  { label: 'A client portal', text: 'your clients will actually use' },
]
</script>

<template>
  <aside
    aria-label="Product highlights"
    class="hidden md:flex w-[55%] shrink-0 flex-col px-12 py-10 text-white brand-panel relative overflow-hidden"
  >
    <div class="absolute inset-0 opacity-[0.04] pointer-events-none" aria-hidden="true" style="background-image: linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px); background-size: 48px 48px;" />

    <NuxtLink to="/" class="relative flex items-center gap-2.5 no-underline">
      <span class="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/95 text-(--green-deep) text-[12px] font-bold">F</span>
      <span class="text-[15px] font-semibold text-white tracking-[-0.01em]">FitCoach</span>
    </NuxtLink>

    <div class="relative mt-14">
      <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/70">
        <span aria-hidden="true" class="inline-flex h-1.5 w-1.5 rounded-full bg-[#34D399]" />
        Built for coaches
      </div>

      <h1 class="mt-5 text-[44px] leading-[1.05] font-semibold tracking-[-0.02em] max-w-[460px]">
        Run your<br />business.<br />
        <span class="text-[#4ADE80]">Not your inbox.</span>
      </h1>

      <p class="mt-5 text-[14px] leading-[1.6] text-white/70 max-w-[440px]">
        Stop patching together spreadsheets, WhatsApp threads, and PayPal invoices. Everything you need to coach professionally, in one place.
      </p>

      <ul class="mt-7 space-y-3 max-w-[460px]">
        <li
          v-for="(prop, i) in VALUE_PROPS"
          :key="i"
          class="flex items-start gap-2.5 text-[13px] text-white/85"
        >
          <span aria-hidden="true" class="mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[rgba(74,222,128,0.2)]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" stroke-width="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span><strong class="font-semibold text-white">{{ prop.label }}</strong> {{ prop.text }}</span>
        </li>
      </ul>
    </div>

    <div class="relative mt-auto pt-10 flex items-center gap-3 border-t border-white/10">
      <div class="flex -space-x-2" aria-hidden="true">
        <span class="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-(--green-deep) text-[9.5px] font-semibold text-white bg-(--green-brand)">JR</span>
        <span class="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-(--green-deep) text-[9.5px] font-semibold text-white" style="background: #C2410C;">KN</span>
        <span class="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-(--green-deep) text-[9.5px] font-semibold text-white" style="background: #2563EB;">TS</span>
        <span class="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-(--green-deep) text-[9.5px] font-semibold text-white" style="background: #9333EA;">AL</span>
      </div>
      <div class="text-[11.5px] text-white/65">
        <div class="text-[#FBBF24] tracking-[2px]" aria-label="5 out of 5 stars">★★★★★</div>
        <div class="mt-0.5">In trial with <strong class="text-white">5 coaches</strong> · Lagos, Ibadan, Abuja</div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.brand-panel {
  background: radial-gradient(ellipse at top left, #1A6B3D 0%, #0D3D22 60%, #0A2818 100%);
}
</style>
