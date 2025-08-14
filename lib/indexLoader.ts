import Fuse from 'fuse.js'
import type { PokemonIndexEntry } from './canon'

export type { PokemonIndexEntry }

export type LoadedIndex = {
  entries: PokemonIndexEntry[]
  fuse: Fuse<PokemonIndexEntry>
}

export async function loadIndex(): Promise<LoadedIndex> {
  const res = await fetch('/data/pokemon.index.json')
  if (!res.ok) throw new Error('Failed to load Pokémon index')
  const entries: PokemonIndexEntry[] = await res.json()

  const fuse = new Fuse(entries, {
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.3,
    minMatchCharLength: 2,
    keys: [
      { name: 'displayName', weight: 0.7 },
      { name: 'aliases', weight: 0.3 },
    ],
  })

  return { entries, fuse }
}

