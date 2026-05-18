import type { Ref } from 'vue'

export function usePasswordStrength(password: Ref<string>) {
  const score = computed(() => {
    const val = password.value
    if (!val) return 0
    let s = 0
    if (val.length >= 8) s++
    if (val.length >= 12) s++
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) s++
    if (/[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val)) s++
    return Math.max(s, 1)
  })

  const _bar = ['', 'bg-[#EF4444]', 'bg-[#F59E0B]', 'bg-[#3B82F6]', 'bg-[#22C55E]']
  const _text = ['', 'text-[#EF4444]', 'text-[#F59E0B]', 'text-[#3B82F6]', 'text-[#22C55E]']
  const _label = ['', 'Weak', 'Fair', 'Good', 'Strong']

  const barColor = computed(() => _bar[score.value] ?? '')
  const textColor = computed(() => _text[score.value] ?? '')
  const label = computed(() => _label[score.value] ?? '')

  return { score, barColor, textColor, label }
}
