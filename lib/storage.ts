export type Settings = {
  silhouette: boolean
  suggestions: boolean
  gens: number[]
}

const KEY = 'pq.settings.v1'

export function loadSettings(): Settings {
  if (typeof window === 'undefined')
    return { silhouette: false, suggestions: true, gens: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw)
      return { silhouette: false, suggestions: true, gens: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
    const parsed = JSON.parse(raw)
    const gens =
      Array.isArray(parsed.gens) && parsed.gens.length > 0
        ? parsed.gens
        : [1, 2, 3, 4, 5, 6, 7, 8, 9]
    return {
      silhouette: !!parsed.silhouette,
      suggestions: parsed.suggestions !== false, // default true
      gens,
    }
  } catch {
    return { silhouette: false, suggestions: true, gens: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
  }
}

export function saveSettings(s: Settings) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(s))
}
