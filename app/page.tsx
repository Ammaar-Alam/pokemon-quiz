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
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [streak, setStreak] = useState(0)
  const [flash, setFlash] = useState<
    | null
    | {
        kind: 'correct' | 'skip' | 'reveal'
        name: string
      }
  >(null)
  const [wrongFlash, setWrongFlash] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const [best, setBest] = useState(0)

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
    if (typeof window !== 'undefined') {
      const b = Number(localStorage.getItem('pq.best.v1') || '0')
      if (!Number.isNaN(b)) setBest(b)
    }
  }, [])

  useEffect(() => {
    const q = canon(input)
    if (!settings.suggestions || !q || pool.length === 0) {
      setSuggestions([])
      setSelectedIdx(-1)
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
    setSelectedIdx(result.length ? 0 : -1)
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
      const newStreak = streak + 1
      setStreak(newStreak)
      const newBest = Math.max(best, newStreak)
      setBest(newBest)
      if (typeof window !== 'undefined') {
        localStorage.setItem('pq.best.v1', String(newBest))
      }
      setFlash({ kind: 'correct', name: target.displayName })
      setTimeout(() => {
        setFlash(null)
        nextTarget()
      }, 1000)
    } else {
      setWrongFlash(true)
      setTimeout(() => setWrongFlash(false), 420)
    }
  }

  function reveal() {
    if (!target) return
    setStreak(0)
    setFlash({ kind: 'reveal', name: target.displayName })
    setTimeout(() => {
      setFlash(null)
      nextTarget()
    }, 900)
  }

  function skip() {
    if (!target) return
    setStreak(0)
    setFlash({ kind: 'skip', name: target.displayName })
    setTimeout(() => {
      setFlash(null)
      nextTarget()
    }, 900)
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
          'relative w-full max-w-sm aspect-square rounded-xl grid place-items-center overflow-hidden bg-slate-900/60 ' +
          (flash?.kind === 'correct' ? 'animate-[pop-bounce_300ms_ease]' : '')
        }
        style={{ animationFillMode: 'both' }}
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
                : 'drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)]'
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

        {/* Celebration overlay */}
        {flash?.kind === 'correct' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-full border-2 border-emerald-400/70 p-2 animate-[glow-pulse_800ms_ease]" />
            {[...Array(18)].map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${(i * 100) / 18}%`,
                  backgroundColor: ['#34d399', '#22c55e', '#fbbf24', '#60a5fa', '#f472b6'][i % 5],
                  animationDelay: `${(i % 6) * 30}ms`,
                }}
              />
            ))}
            <div className="absolute bottom-3 text-emerald-400 text-sm font-medium bg-slate-900/60 px-3 py-1.5 rounded-md border border-emerald-500/30">
              Correct! {flash.name}
            </div>
          </div>
        )}

        {(flash?.kind === 'skip' || flash?.kind === 'reveal') && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-gradient-to-t from-slate-950/70 to-slate-900/20">
            <div className="text-slate-200 text-sm font-medium bg-slate-900/70 px-3 py-1.5 rounded-md border border-slate-700">
              It was {flash.name}
            </div>
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
          <div className="text-sm text-slate-400">Streak: {streak} · Best: {best}</div>
          <button
            type="button"
            className="rounded-md border border-slate-700 bg-slate-900/40 hover:bg-slate-800 px-2.5 py-1 text-xs text-slate-200 shadow-sm"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
            title="Settings"
          >
            ⚙️
          </button>
        </div>

      <div className="w-full max-w-sm">
        <input
          type="text"
          placeholder="Type a Pokémon name..."
          className={
            'w-full rounded-lg bg-slate-900 border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-600 ' +
            (wrongFlash ? 'border-rose-500 animate-[shake_420ms]' : 'border-slate-800')
          }
          aria-label="Guess Pokémon"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter')
              submitGuess(
                selectedIdx >= 0 ? suggestions[selectedIdx]?.displayName : undefined,
              )
            if (e.key === 'Tab') {
              if (settings.suggestions && selectedIdx >= 0) {
                e.preventDefault()
                // Autocomplete to selected suggestion but don't submit
                const name = suggestions[selectedIdx]?.displayName
                if (name) {
                  setInput(name)
                  setSuggestions([])
                  setSelectedIdx(-1)
                }
              }
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
              e.preventDefault()
              skip()
            } else if (e.key === 'ArrowDown') {
              e.preventDefault()
              setSelectedIdx((idx) =>
                suggestions.length ? (idx + 1) % suggestions.length : -1,
              )
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setSelectedIdx((idx) =>
                suggestions.length
                  ? (idx - 1 + suggestions.length) % suggestions.length
                  : -1,
              )
            }
          }}
        />
        {suggestions.length > 0 && (
          <ul
            role="listbox"
            className="mt-1 max-h-60 overflow-auto rounded-lg border border-slate-800 bg-slate-900"
          >
            {suggestions.map((s, i) => (
              <li
                role="option"
                key={s.id}
                className={(i === selectedIdx ? 'bg-slate-800 ' : '') + 'px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 cursor-pointer'}
                onMouseEnter={() => setSelectedIdx(i)}
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
            className="rounded-md bg-gradient-to-b from-slate-700 to-slate-800 px-3 py-1.5 text-sm text-slate-100 hover:from-slate-600 hover:to-slate-700 border border-slate-700 shadow-sm"
            onClick={() => submitGuess()}
          >
            Submit
          </button>
          <button
            type="button"
            className="rounded-md bg-gradient-to-b from-slate-700 to-slate-800 px-3 py-1.5 text-sm text-slate-100 hover:from-slate-600 hover:to-slate-700 border border-slate-700 shadow-sm"
            onClick={() => skip()}
            title="Tab to skip"
          >
            Skip
          </button>
          <button
            type="button"
            className="rounded-md bg-gradient-to-b from-rose-700 to-rose-800 px-3 py-1.5 text-sm text-slate-100 hover:from-rose-600 hover:to-rose-700 border border-rose-700 shadow-sm"
            onClick={reveal}
          >
            Reveal (reset)
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">Enter = Submit · Tab = Autocomplete · Ctrl/Cmd+K = Skip</p>
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
                  'rounded-md px-2 py-1.5 text-xs border transition-colors ' +
                  (pressed
                    ? 'bg-gradient-to-b from-slate-700 to-slate-800 border-slate-600 text-slate-100 shadow-sm'
                    : 'bg-transparent border-slate-800 text-slate-400 hover:bg-slate-900')
                }
              >
                Gen {n}
              </button>
            )
          })}
        </div>
      </div>

      {/* Settings Drawer */}
      {settingsOpen && (
        <div className="fixed inset-0 z-20">
          <div
            className="absolute inset-0 bg-slate-950/70"
            onClick={() => setSettingsOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <h2 className="text-sm font-semibold">Settings</h2>
              <button
                className="rounded-md border border-slate-700 bg-slate-900/40 hover:bg-slate-800 px-2 py-1 text-xs"
                onClick={() => setSettingsOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="p-4 space-y-4">
              <label className="flex items-center justify-between gap-4 text-sm">
                <span>Silhouette mode</span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-slate-500"
                  checked={settings.silhouette}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, silhouette: e.target.checked }))
                  }
                />
              </label>
              <label className="flex items-center justify-between gap-4 text-sm">
                <span>Show suggestions</span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-slate-500"
                  checked={settings.suggestions}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, suggestions: e.target.checked }))
                  }
                />
              </label>
              <div className="border-t border-slate-800 pt-3 text-xs text-slate-400">
                <p>Hotkeys: Enter = Submit, Tab = Autocomplete, Ctrl/Cmd+K = Skip</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {flash?.kind === 'correct'
          ? `Correct! ${flash.name}`
          : flash?.kind === 'skip' || flash?.kind === 'reveal'
          ? `It was ${flash.name}`
          : ''}
      </div>
    </section>
  )
}
