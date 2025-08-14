'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadIndex, type PokemonIndexEntry } from '@/lib/indexLoader'
import { canon } from '@/lib/canon'
import { loadSettings, saveSettings, type Settings } from '@/lib/storage'

type Suggestion = PokemonIndexEntry

export default function HomePage() {
  const [loaded, setLoaded] = useState(false)
  const [entries, setEntries] = useState<PokemonIndexEntry[]>([])
  const [target, setTarget] = useState<PokemonIndexEntry | null>(null)
  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [streak, setStreak] = useState(0)
  const [flashCorrect, setFlashCorrect] = useState<{ name: string } | null>(
    null,
  )

  const pool = useMemo(
    () => entries.filter((e) => settings.gens.includes(e.generation)),
    [entries, settings.gens],
  )

  const nextTarget = useCallback(() => {
    if (pool.length === 0) return
    const idx = Math.floor(Math.random() * pool.length)
    setTarget(pool[idx])
    setInput('')
    setSuggestions([])
  }, [pool])

  useEffect(() => {
    loadIndex()
      .then(({ entries /*, fuse*/ }) => {
        entries.sort((a, b) => a.id - b.id)
        setEntries(entries)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  useEffect(() => {
    if (loaded) nextTarget()
  }, [loaded, nextTarget, settings.gens])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    const q = canon(input)
    if (!q || pool.length === 0) {
      setSuggestions([])
      return
    }
    const result = pool
      .filter(
        (e) =>
          e.canonicalName.startsWith(q) ||
          e.aliases?.some((a) => a.startsWith(q)),
      )
      .slice(0, 7)
    setSuggestions(result)
  }, [input, pool])

  const isCorrect = useMemo(() => {
    if (!target) return false
    const c = canon(input)
    return (
      c.length > 0 &&
      (c === target.canonicalName || target.aliases.includes(c))
    )
  }, [input, target])

  function submitGuess(name?: string) {
    if (!target) return
    const guess = canon(name ?? input)
    if (guess === target.canonicalName || target.aliases.includes(guess)) {
      setStreak((s) => s + 1)
      setFlashCorrect({ name: target.displayName })
      setTimeout(() => {
        setFlashCorrect(null)
        nextTarget()
      }, 600)
    }
  }

  function reveal() {
    // reset streak and pick next
    setStreak(0)
    nextTarget()
  }

  function skip() {
    // no penalty
    nextTarget()
  }

  function toggleGen(n: number) {
    setSettings((s) => {
      const has = s.gens.includes(n)
      const gens = has ? s.gens.filter((g) => g !== n) : [...s.gens, n]
      gens.sort((a, b) => a - b)
      return { ...s, gens }
    })
  }

  return (
    <section className="flex flex-col items-center gap-6">
      <div
        className={
          'w-full max-w-sm aspect-square rounded-xl grid place-items-center overflow-hidden bg-slate-900/60 ' +
          (flashCorrect ? 'ring-2 ring-emerald-500' : '')
        }
      >
        {target ? (
          <Image
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${target.id}.png`}
            alt={target.displayName}
            width={480}
            height={480}
            className={
              settings.silhouette
                ? 'brightness-0 saturate-100 drop-shadow-[0_0_2px_rgba(255,255,255,0.25)]'
                : ''
            }
            priority
          />
        ) : (
          <div className="text-slate-400 text-sm">
            {loaded
              ? pool.length === 0
                ? 'No generations selected.'
                : 'No data. Run npm run build:index'
              : 'Loading...'}
          </div>
        )}
      </div>

      <div className="w-full max-w-sm flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            className="h-4 w-4 accent-slate-500"
            checked={settings.silhouette}
            onChange={(e) =>
              setSettings((s) => ({ ...s, silhouette: e.target.checked }))
            }
          />
          Silhouette
        </label>
        <div className="text-sm text-slate-400">Streak: {streak}</div>
      </div>

      <div className="w-full max-w-sm">
        <input
          type="text"
          placeholder="Type a Pokémon name..."
          className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-600"
          aria-label="Guess Pokémon"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitGuess()
            if (e.key === 'Tab') {
              e.preventDefault()
              skip()
            }
          }}
        />
        {suggestions.length > 0 && (
          <ul
            role="listbox"
            className="mt-1 max-h-60 overflow-auto rounded-lg border border-slate-800 bg-slate-900"
          >
            {suggestions.map((s) => (
              <li
                role="option"
                key={s.id}
                className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 cursor-pointer"
                onClick={() => submitGuess(s.displayName)}
              >
                {s.displayName}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-slate-100 hover:bg-slate-700 border border-slate-700"
            onClick={() => submitGuess()}
          >
            Submit
          </button>
          <button
            type="button"
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-slate-100 hover:bg-slate-700 border border-slate-700"
            onClick={() => skip()}
            title="Tab to skip"
          >
            Skip
          </button>
          <button
            type="button"
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-slate-100 hover:bg-slate-700 border border-slate-700"
            onClick={reveal}
          >
            Reveal (reset)
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">Enter = Submit, Tab = Skip</p>
      </div>

      <div className="w-full max-w-sm border-t border-slate-800 pt-4">
        <p className="text-xs text-slate-400 mb-2">Generations</p>
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => {
            const pressed = settings.gens.includes(n)
            return (
              <button
                key={n}
                type="button"
                aria-pressed={pressed}
                onClick={() => toggleGen(n)}
                className={
                  'rounded-md px-2 py-1.5 text-xs border ' +
                  (pressed
                    ? 'bg-slate-800 border-slate-600 text-slate-100'
                    : 'bg-transparent border-slate-800 text-slate-400 hover:bg-slate-900')
                }
              >
                Gen {n}
              </button>
            )
          })}
        </div>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {flashCorrect ? `Correct! ${flashCorrect.name}` : ''}
      </div>
    </section>
  )
}
