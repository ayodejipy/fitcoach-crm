import type { Ref } from 'vue'

const REQUIREMENTS = [
  { regex: /.{8,}/, text: 'At least 8 characters' },
  { regex: /\d/, text: 'At least 1 number' },
  { regex: /[a-z]/, text: 'At least 1 lowercase letter' },
  { regex: /[A-Z]/, text: 'At least 1 uppercase letter' },
] as const

export function usePasswordStrength(password: Ref<string>) {
  const strength = computed(() =>
    REQUIREMENTS.map(req => ({ met: req.regex.test(password.value), text: req.text }))
  )

  const score = computed(() => strength.value.filter(r => r.met).length)

  const color = computed(() => {
    if (score.value === 0) return 'neutral'
    if (score.value <= 1) return 'error'
    if (score.value <= 2) return 'warning'
    if (score.value === 3) return 'warning'
    return 'success'
  })

  const label = computed(() => {
    if (score.value === 0) return ''
    if (score.value <= 2) return 'Weak password'
    if (score.value === 3) return 'Medium password'
    return 'Strong password'
  })

  return { strength, score, color, label }
}
