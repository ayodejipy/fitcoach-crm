<template>
  <div
    class="rounded-full flex items-center justify-center font-bold text-white shrink-0"
    :class="[`av-${variant}`, { 'opacity-70': muted }]"
    :style="{ width: size + 'px', height: size + 'px', fontSize: fontSize + 'px' }"
  >
    {{ initials }}
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  initials: string
  variant?: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
  size?: number
  muted?: boolean
}>(), {
  variant: 'a',
  size: 34,
  muted: false,
})

const fontSize = computed(() => {
  if (props.size <= 28) return 11
  if (props.size <= 32) return 12
  if (props.size <= 36) return 13
  return Math.round(props.size * 0.38)
})
</script>

<style scoped>
.av-a { background: linear-gradient(135deg, #2ECC71, #1A7A4A); }
.av-b { background: linear-gradient(135deg, #3498DB, #1A5276); }
.av-c { background: linear-gradient(135deg, #E67E22, #C0392B); }
.av-d { background: linear-gradient(135deg, #9B59B6, #6C3483); }
.av-e { background: linear-gradient(135deg, #1ABC9C, #148F77); }
.av-f { background: linear-gradient(135deg, #E74C3C, #922B21); }
.av-g { background: linear-gradient(135deg, #F39C12, #D35400); }
.av-h { background: linear-gradient(135deg, #2980B9, #1A3A5C); }
</style>
