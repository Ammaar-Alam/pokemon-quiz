export type Settings = {
  silhouette: boolean
  gens: number[]
}

const KEY = 'pq.settings.v1'

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return { silhouette: false, gens: [1,2,3,4,5,6,7,8,9] }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { silhouette: false, gens: [1,2,3,4,5,6,7,8,9] }
    const parsed = JSON.parse(raw)
    const gens = Array.isArray(parsed.gens) && parsed.gens.length > 0 ? parsed.gens : [1,2,3,4,5,6,7,8,9]
    return { silhouette: !!parsed.silhouette, gens }
  } catch {
    return { silhouette: false, gens: [1,2,3,4,5,6,7,8,9] }
  }
}

export function saveSettings(s: Settings) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(s))
}

