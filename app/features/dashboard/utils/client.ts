import type { ModelsClient } from '~/services/types.gen'

export const AVATAR_VARIANTS = ['a', 'b', 'c', 'd', 'e'] as const
export type AvatarVariant = typeof AVATAR_VARIANTS[number]

export function hashVariant(id: string): AvatarVariant {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % AVATAR_VARIANTS.length
  return AVATAR_VARIANTS[h]!
}

export function clientInitials(c: ModelsClient): string {
  return `${c.first_name?.[0] ?? ''}${c.last_name?.[0] ?? ''}`.toUpperCase() || '?'
}

export function clientName(c?: ModelsClient, fallback = 'Unknown Client'): string {
  if (!c) return fallback
  return [c.first_name, c.last_name].filter(Boolean).join(' ') || fallback
}
