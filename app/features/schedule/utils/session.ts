import { formatISO } from 'date-fns'

export function parseStartsAt(date: string, time: string): string {
  const parts = time.split(' ')
  const period = parts[1]
  const nums = (parts[0] ?? '0:0').split(':').map(Number)
  let h = nums[0] ?? 0
  const m = nums[1] ?? 0
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0

  return formatISO(new Date(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`))
}

export function parseDurationMins(duration: string): number {
  if (duration.includes('hour')) return parseInt(duration) * 60
  return parseInt(duration)
}
