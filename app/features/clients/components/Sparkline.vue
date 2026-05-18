<template>
  <div class="flex items-end gap-[2px] h-[18px]">
    <div
      v-for="(bar, i) in bars"
      :key="i"
      class="w-[6px] rounded-t-[2px] transition-colors duration-150"
      :class="barClass(bar)"
      :style="{ height: bar.height + 'px' }"
    ></div>
  </div>
</template>

<script setup lang="ts">
interface Bar {
  height: number
  hi?: boolean
}

const props = withDefaults(defineProps<{
  bars: Bar[]
  muted?: boolean
}>(), {
  muted: false,
})

const barClass = (bar: Bar) => {
  if (props.muted) return bar.hi ? 'spark-bar-muted-hi' : 'spark-bar-muted'
  return bar.hi ? 'spark-bar-hi' : 'spark-bar'
}
</script>

<style scoped>
.spark-bar     { background: #C8E6D5; }
.spark-bar-hi  { background: var(--green-brand); }
:global(tr:hover) .spark-bar    { background: #7ECFA3; }
:global(tr:hover) .spark-bar-hi { background: var(--green-hover); }

.spark-bar-muted    { background: #D5DDD7; }
.spark-bar-muted-hi { background: #BDC3C7; }
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .spark-bar     { background: rgba(46, 204, 113, .2); }
.dark .spark-bar-hi  { background: var(--green-light); }
.dark .spark-bar-muted    { background: rgba(255, 255, 255, .08); }
.dark .spark-bar-muted-hi { background: rgba(255, 255, 255, .2); }
</style>
