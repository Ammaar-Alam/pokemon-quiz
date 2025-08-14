/* Build-time script to generate public/data/pokemon.index.json
 * Requires Node 20+ (global fetch). Run: npm run build:index
 */

import { writeFile, mkdir } from 'node:fs/promises'
import { basename } from 'node:path'

type NamedAPIResource = { name: string; url: string }

type Species = {
  name: string
  names: { name: string; language: { name: string } }[]
  generation: NamedAPIResource
  varieties: { is_default: boolean; pokemon: NamedAPIResource }[]
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function canon(input: string): string {
  let s = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
  s = s
    .replace(/[♀]/g, 'f')
    .replace(/[♂]/g, 'm')
    .replace(/['’`]/g, '')
    .replace(/[.\-\s_]/g, '')
  return s
}

function displayNameFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

function aliasVariants(name: string): string[] {
  const set = new Set<string>()
  const base = canon(name)
  set.add(base)
  set.add(base.replace(/female/g, 'f'))
  set.add(base.replace(/male/g, 'm'))
  return Array.from(set)
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed ${res.status} for ${url}`)
  return (await res.json()) as T
}

async function main() {
  const outDir = 'public/data'
  const outFile = `${outDir}/pokemon.index.json`
  await mkdir(outDir, { recursive: true })

  const allEntries: any[] = []

  for (let gen = 1; gen <= 9; gen++) {
    const genData = await fetchJSON<{ pokemon_species: NamedAPIResource[] }>(
      `https://pokeapi.co/api/v2/generation/${gen}/`,
    )
    const speciesList = genData.pokemon_species
    // PokeAPI returns in random order; stable sort by name
    speciesList.sort((a, b) => a.name.localeCompare(b.name))

    // Concurrency control
    const concurrency = 10
    let i = 0
    while (i < speciesList.length) {
      const batch = speciesList.slice(i, i + concurrency)
      await Promise.all(
        batch.map(async (sp) => {
          try {
            const species = await fetchJSON<Species>(sp.url)
            const english =
              species.names.find((n) => n.language.name === 'en')?.name ||
              displayNameFromSlug(species.name)
            const def = species.varieties.find((v) => v.is_default)?.pokemon
            if (!def) return
            const idMatch = def.url.match(/\/(\d+)\/?$/)
            if (!idMatch) return
            const id = Number(idMatch[1])
            allEntries.push({
              id,
              displayName: english,
              canonicalName: canon(english),
              generation: gen,
              aliases: aliasVariants(english),
            })
          } catch (e) {
            console.warn('skip species', sp.name, e)
          }
        }),
      )
      i += concurrency
      // be polite to API
      await sleep(80)
    }
  }

  // Deduplicate by id and sort
  const byId = new Map<number, any>()
  for (const e of allEntries) if (!byId.has(e.id)) byId.set(e.id, e)
  const entries = Array.from(byId.values()).sort((a, b) => a.id - b.id)

  await writeFile(outFile, JSON.stringify(entries, null, 2))
  console.log(`Wrote ${entries.length} entries → ${basename(outFile)}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

