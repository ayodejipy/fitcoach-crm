import type { ModelsClient } from '~/services'

export const AVATAR_VARIANTS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const
export type AvatarVariant = typeof AVATAR_VARIANTS[number]

export function hashVariant(id: string): AvatarVariant {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return AVATAR_VARIANTS[h % 8]!
}

export function clientInitials(c?: ModelsClient): string {
  return `${c?.first_name?.[0] ?? ''}${c?.last_name?.[0] ?? ''}`.toUpperCase() || '?'
}

export function clientName(c?: ModelsClient, fallback = 'Unknown Client'): string {
  if (!c) return fallback
  return [c.first_name, c.last_name].filter(Boolean).join(' ') || fallback
}
