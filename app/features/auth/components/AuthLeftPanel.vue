<template>
  <div class="left-panel w-[46%] bg-(--green-deep) relative overflow-hidden flex flex-col pt-9 px-12 pb-10 shrink-0 hidden md:flex">
    <!-- Logo -->
    <div class="flex items-center gap-2.5 relative z-[2] shrink-0">
      <div class="w-[34px] h-[34px] rounded-[9px] bg-primary flex items-center justify-center shadow-[0_2px_12px_rgba(46,204,113,0.25)] shrink-0">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
          <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="text-[17px] font-bold text-white/90 tracking-[-0.2px]">FitCoach CRM</span>
    </div>

    <!-- Copy -->
    <div class="mt-[52px] relative z-[2] shrink-0">
      <div class="text-[11px] font-bold tracking-[0.1em] uppercase text-(--green-mid) mb-3.5 flex items-center gap-2 before:content-[''] before:w-5 before:h-[2px] before:bg-(--green-mid) before:rounded-[1px]">Built for coaches</div>
      <h1 class="text-[34px] font-[900] leading-[1.15] text-white tracking-[-0.8px] mb-4">
        Run your business.<br>
        <em class="not-italic text-primary-light">Not your inbox.</em>
      </h1>
      <p class="text-[15px] text-white/50 leading-[1.65] max-w-[320px] font-normal">Stop patching together spreadsheets, WhatsApp threads, and PayPal invoices. Everything you need to coach professionally, in one place.</p>
    </div>

    <!-- Value props -->
    <div class="mt-8 flex flex-col gap-[11px] relative z-[2] shrink-0">
      <div class="flex items-center gap-[11px]">
        <div class="w-5 h-5 rounded-full bg-[rgba(46,204,113,0.15)] border border-[rgba(46,204,113,0.3)] flex items-center justify-center shrink-0">
          <svg width="10" height="10" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#2ECC71" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <span class="text-[13.5px] text-white/65 font-normal"><strong class="text-white/85 font-semibold">Client check-ins</strong> collected automatically every week</span>
      </div>
      <div class="flex items-center gap-[11px]">
        <div class="w-5 h-5 rounded-full bg-[rgba(46,204,113,0.15)] border border-[rgba(46,204,113,0.3)] flex items-center justify-center shrink-0">
          <svg width="10" height="10" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#2ECC71" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <span class="text-[13.5px] text-white/65 font-normal"><strong class="text-white/85 font-semibold">Sessions, payments, and progress</strong> in a single dashboard</span>
      </div>
      <div class="flex items-center gap-[11px]">
        <div class="w-5 h-5 rounded-full bg-[rgba(46,204,113,0.15)] border border-[rgba(46,204,113,0.3)] flex items-center justify-center shrink-0">
          <svg width="10" height="10" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#2ECC71" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <span class="text-[13.5px] text-white/65 font-normal"><strong class="text-white/85 font-semibold">A client portal</strong> your clients will actually use</span>
      </div>
    </div>

    <!-- Floating preview cards -->
    <div class="absolute bottom-[100px] -right-[10px] w-[310px] h-[280px] z-[3]">
      <!-- Notification chip -->
      <div class="pc-notif">
        <div class="w-2 h-2 rounded-full bg-primary-light shrink-0 pulse-dot"></div>
        <span class="text-[11.5px] font-semibold text-white/85">Sofia submitted her check-in</span>
        <span class="text-[10.5px] text-white/35 ml-1">2m ago</span>
      </div>

      <!-- Card A: Pending check-ins -->
      <div class="pc-checkins dark:bg-gray-900/95 dark:backdrop-blur-md dark:border dark:border-white/10">
        <div class="text-[9.5px] font-bold uppercase tracking-[0.07em] text-(--text-muted) dark:text-gray-400 mb-2.5 flex items-center justify-between">
          Pending Check-ins
          <span class="bg-[#FEF3C7] text-[#92400E] dark:bg-[#92400E]/20 dark:text-[#FEF3C7] text-[9px] font-[800] px-1.5 py-0.5 rounded-[20px]">3 unread</span>
        </div>
        <div class="flex items-center gap-2 py-1.25 border-b border-[#F3F6F4] dark:border-white/10">
          <div class="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] font-[800] text-white shrink-0 bg-gradient-to-br from-primary to-primary-400">SR</div>
          <span class="text-[11px] font-semibold text-(--text-primary) dark:text-white flex-1">Sofia R.</span>
          <span class="text-[9.5px] text-(--text-muted) dark:text-gray-400">2m</span>
          <div class="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
        </div>
        <div class="flex items-center gap-2 py-1.25 border-b border-[#F3F6F4] dark:border-white/10">
          <div class="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] font-[800] text-white shrink-0 bg-gradient-to-br from-[#2563EB] to-[#60A5FA]">JL</div>
          <span class="text-[11px] font-semibold text-(--text-primary) dark:text-white flex-1">James L.</span>
          <span class="text-[9.5px] text-(--text-muted) dark:text-gray-400">4h</span>
          <div class="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
        </div>
        <div class="flex items-center gap-2 py-1.25">
          <div class="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] font-[800] text-white shrink-0 bg-gradient-to-br from-[#9333EA] to-[#C084FC]">MP</div>
          <span class="text-[11px] font-semibold text-(--text-primary) dark:text-white flex-1">Maya P.</span>
          <span class="text-[9.5px] text-(--text-muted) dark:text-gray-400">1d</span>
          <div class="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
        </div>
      </div>

      <!-- Card B: Revenue -->
      <div class="pc-revenue dark:bg-gray-900/95 dark:backdrop-blur-md dark:border dark:border-white/10">
        <div class="text-[9.5px] font-bold uppercase tracking-[0.07em] text-(--text-muted) dark:text-gray-400 mb-2.5 flex items-center justify-between">Monthly Revenue <span class="bg-(--green-pale) text-primary dark:bg-primary/20 dark:text-(--green-pale) text-[9px] font-[800] px-1.5 py-0.5 rounded-[20px]">↑ 12%</span></div>
        <div class="text-[24px] font-[900] text-primary dark:text-(--green-light) tracking-[-0.5px] leading-none mb-1">$3,840</div>
        <div class="text-[10.5px] font-semibold text-primary dark:text-(--green-light) flex items-center gap-[3px] mb-2.5">
          <svg width="10" height="10" fill="none" viewBox="0 0 12 12"><path d="M2 9L6 3l4 6" fill="currentColor"/></svg>
          +$420 vs last month
        </div>
        <!-- Mini sparkline SVG -->
        <svg class="w-full h-8" viewBox="0 0 158 32" preserveAspectRatio="none">
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--color-primary-500)" stop-opacity=".18"/>
              <stop offset="100%" stop-color="var(--color-primary-500)" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <polygon points="0,28 22,24 44,26 66,18 88,20 110,12 132,8 158,4 158,32 0,32" fill="url(#revGrad)"/>
          <polyline points="0,28 22,24 44,26 66,18 88,20 110,12 132,8 158,4" fill="none" class="stroke-primary" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div><!-- /lp-preview -->

    <!-- Social proof -->
    <div class="mt-auto relative z-[2] flex items-center gap-3 pt-6 border-t border-white/5 shrink-0">
      <div class="flex">
        <div class="w-7 h-7 rounded-full border-2 border-(--green-deep) flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br from-primary to-primary-400">JR</div>
        <div class="w-7 h-7 rounded-full border-2 border-(--green-deep) flex items-center justify-center text-[10px] font-bold text-white -ml-2 bg-gradient-to-br from-[#2563EB] to-[#60A5FA]">KM</div>
        <div class="w-7 h-7 rounded-full border-2 border-(--green-deep) flex items-center justify-center text-[10px] font-bold text-white -ml-2 bg-gradient-to-br from-[#9333EA] to-[#C084FC]">TS</div>
        <div class="w-7 h-7 rounded-full border-2 border-(--green-deep) flex items-center justify-center text-[10px] font-bold text-white -ml-2 bg-gradient-to-br from-[#D97706] to-[#FCD34D]">AL</div>
      </div>
      <div class="text-[12px] text-white/45 leading-[1.5]">
        <div class="text-[#F59E0B] text-[12px] tracking-[0.5px]">★★★★★</div>
        <div><strong class="text-white/70 font-semibold">200+ coaches</strong> have made the switch</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Dot grid & Vignette */
.left-panel::before {
  content: '';
  position: absolute; inset: 0; z-index: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,.055) 1px, transparent 1px);
  background-size: 26px 26px;
}
.left-panel::after {
  content: '';
  position: absolute; inset: 0; z-index: 0;
  background: radial-gradient(ellipse 80% 70% at 60% 45%, rgba(26,122,74,.07) 0%, transparent 70%);
}

/* Animations */
.pc-checkins {
  position: absolute; top: 0; right: 30px; width: 218px;
  background: white; border-radius: 14px;
  box-shadow: var(--shadow-float); padding: 14px 15px;
  transform: rotate(-2.5deg);
  animation: float1 5s ease-in-out infinite;
}
@keyframes float1 {
  0%, 100% { transform: rotate(-2.5deg) translateY(0); }
  50%       { transform: rotate(-2.5deg) translateY(-7px); }
}

.pc-revenue {
  position: absolute; bottom: 0; left: 0; width: 188px;
  background: white; border-radius: 14px;
  box-shadow: var(--shadow-float); padding: 14px 15px;
  transform: rotate(1.8deg);
  animation: float2 6.5s ease-in-out infinite;
}
@keyframes float2 {
  0%, 100% { transform: rotate(1.8deg) translateY(0); }
  50%       { transform: rotate(1.8deg) translateY(-5px); }
}

.pc-notif {
  position: absolute; top: 118px; left: -10px;
  background: var(--color-primary-deep);
  border: 1px solid rgba(46,204,113,.25); border-radius: 22px;
  padding: 7px 13px 7px 10px; display: flex; align-items: center; gap: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,.35); white-space: nowrap;
  animation: float3 4.2s ease-in-out infinite;
}
@keyframes float3 {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-9px); }
}

.pulse-dot { animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(46,204,113,.5); } 50% { box-shadow: 0 0 0 5px rgba(46,204,113,0); } }
</style>
