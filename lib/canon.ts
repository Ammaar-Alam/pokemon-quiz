export function canon(input: string): string {
  let s = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
  s = s
    .replace(/[♀]/g, 'f')
    .replace(/[♂]/g, 'm')
    .replace(/['’`]/g, '')
    .replace(/[.\-\s_]/g, '')
  return s
}

export function aliasVariants(name: string): string[] {
  const set = new Set<string>()
  const base = canon(name)
  set.add(base)
  // Add a few typical alternates
  set.add(base.replace(/female/g, 'f'))
  set.add(base.replace(/male/g, 'm'))
  return Array.from(set)
}

export function displayNameFromSlug(slug: string): string {
  // Basic capitalization for fallback
  return slug
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

export type PokemonIndexEntry = {
  id: number
  displayName: string
  canonicalName: string
  generation: number
  aliases: string[]
}

