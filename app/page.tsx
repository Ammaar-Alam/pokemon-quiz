'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadIndex, type PokemonIndexEntry } from '@/lib/indexLoader'
import { canon } from '@/lib/canon'
import { loadSettings, saveSettings, type Settings } from '@/lib/storage'
import type Fuse from 'fuse.js'
import { GearIcon } from '@/components/Icons'

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
  const [fuse, setFuse] = useState<Fuse<PokemonIndexEntry> | null>(null)

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
      .then(({ entries, fuse }) => {
        entries.sort((a, b) => a.id - b.id)
        setEntries(entries)
        setFuse(fuse)
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
      const handler = () => setSettingsOpen(true)
      window.addEventListener('open-settings', handler as EventListener)
      return () => window.removeEventListener('open-settings', handler as EventListener)
    }
  }, [])

  useEffect(() => {
    const q = input.trim()
    if (!settings.suggestions || q.length === 0 || pool.length === 0) {
      setSuggestions([])
      setSelectedIdx(-1)
      return
    }
    // Prefer fuzzy suggestions from Fuse, then fall back to simple prefix match
    let result: PokemonIndexEntry[] = []
    if (fuse) {
      const hits = fuse.search(q, { limit: 12 }).map((h) => h.item)
      result = hits.filter((e) => settings.gens.includes(e.generation)).slice(0, 7)
    } else {
      const cq = canon(q)
      result = pool
        .filter(
          (e) =>
            e.canonicalName.startsWith(cq) || e.aliases?.some((a) => a.startsWith(cq)),
        )
        .slice(0, 7)
    }
    setSuggestions(result)
    setSelectedIdx(result.length ? 0 : -1)
  }, [input, pool, fuse, settings.gens, settings.suggestions])

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
      setStreak(0)
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
    <section className="flex flex-col lg:flex-row w-full gap-6 lg:gap-8 lg:items-center lg:justify-center">
      <div className="w-full lg:flex-shrink-0 lg:w-auto">
        <div
          className={
            'relative w-full lg:w-[450px] xl:w-[500px] aspect-square rounded-2xl grid place-items-center overflow-hidden bg-slate-900/60 border border-slate-800 shadow-xl ' +
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
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full border-2 border-emerald-400/70 p-2 animate-[glow-pulse_800ms_ease]" />
            </div>
            {[...Array(36)].map((_, i) => {
              const left = Math.random() * 100
              const sizeW = 6 + Math.random() * 6
              const sizeH = 10 + Math.random() * 10
              const delay = Math.floor(Math.random() * 200)
              const dur = 700 + Math.floor(Math.random() * 700)
              const drift = (Math.random() * 2 - 1) * 80
              const colors = ['#34d399', '#22c55e', '#fbbf24', '#60a5fa', '#f472b6']
              return (
                <div
                  key={`conf-${i}`}
                  className="confetti-piece"
                  style={{
                    left: `${left}%`,
                    top: `-10%`,
                    width: `${sizeW}px`,
                    height: `${sizeH}px`,
                    backgroundColor: colors[i % colors.length],
                    animationDelay: `${delay}ms`,
                    animationDuration: `${dur}ms`,
                    ['--x' as any]: `${drift}px`,
                  }}
                />
              )
            })}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-emerald-300 text-sm font-medium bg-slate-900/70 px-3 py-1.5 rounded-md border border-emerald-500/30">
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
      </div>

      <div className="w-full lg:flex-1 lg:max-w-md space-y-4">
        <div className="flex items-center justify-between gap-3">
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
            className="rounded-md border border-slate-700 bg-slate-900/40 hover:bg-slate-800 px-2.5 py-1 text-xs text-slate-200 shadow-sm inline-flex items-center gap-1"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
            title="Settings"
          >
            <GearIcon className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </button>
        </div>

        <div className="w-full lg:sticky lg:top-24 sticky bottom-4 bg-slate-950/30 supports-[backdrop-filter]:bg-slate-950/40 backdrop-blur rounded-xl p-3 border border-slate-800 shadow-xl">
        <input
          type="text"
          placeholder="Type a Pokémon name..."
          className={
            'w-full rounded-lg bg-slate-900 border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-600 transition-shadow ' +
            (wrongFlash ? 'border-rose-500 animate-[shake_420ms]' : 'border-slate-800')
          }
          aria-label="Guess Pokémon"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitGuess()
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
            className="mt-1 max-h-60 overflow-auto rounded-lg border border-slate-800 bg-slate-900 shadow-xl"
          >
            {suggestions.map((s, i) => (
              <li
                role="option"
                key={s.id}
                aria-selected={i === selectedIdx}
                className={(i === selectedIdx ? 'bg-slate-800 ' : '') + 'px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 cursor-pointer flex items-center justify-between'}
                onMouseEnter={() => setSelectedIdx(i)}
                onClick={() => submitGuess(s.displayName)}
              >
                <span>{s.displayName}</span>
                <span className="text-[10px] text-slate-500">Gen {s.generation}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            className="rounded-md bg-gradient-to-b from-slate-600 to-slate-700 px-3 py-1.5 text-sm text-slate-100 hover:from-slate-500 hover:to-slate-600 border border-slate-700 shadow-sm active:translate-y-px"
            onClick={() => submitGuess()}
          >
            Submit
          </button>
          <button
            type="button"
            className="rounded-md bg-gradient-to-b from-slate-600 to-slate-700 px-3 py-1.5 text-sm text-slate-100 hover:from-slate-500 hover:to-slate-600 border border-slate-700 shadow-sm active:translate-y-px"
            onClick={() => skip()}
            title="Tab to skip"
          >
            Skip
          </button>
          <button
            type="button"
            className="rounded-md bg-gradient-to-b from-rose-700 to-rose-800 px-3 py-1.5 text-sm text-slate-100 hover:from-rose-600 hover:to-rose-700 border border-rose-700 shadow-sm active:translate-y-px"
            onClick={reveal}
          >
            Reveal (reset)
          </button>
        </div>
          <p className="mt-2 text-xs text-slate-500">Enter = Submit · Tab = Autocomplete · Ctrl/Cmd+K = Skip</p>
        </div>

        <div className="w-full border-t border-slate-800 pt-4">
        <p className="text-xs text-slate-400 mb-2">Generations</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => {
            const pressed = settings.gens.includes(n)
            return (
              <button
                key={n}
                type="button"
                aria-pressed={pressed}
                onClick={() => toggleGen(n)}
                className={
                  'rounded-md px-3 py-2 text-xs border transition-colors ' +
                  (pressed
                    ? 'bg-gradient-to-b from-slate-700 to-slate-800 border-slate-600 text-slate-100 shadow-sm'
                    : 'bg-transparent border-slate-800 text-slate-400 hover:bg-slate-900')
                }
              >
                Gen {['I','II','III','IV','V','VI','VII','VIII','IX'][n-1]}
              </button>
            )
          })}
        </div>
        </div>
      </div>

      {/* Settings Drawer */}
      {settingsOpen && (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSettingsOpen(false)} aria-hidden />
          <div className="absolute right-0 top-0 h-full w-full max-w-md rounded-l-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-2xl backdrop-blur transition-transform animate-[pop-bounce_200ms_ease]">
            <div className="flex items-center justify-between border-b border-[var(--glass-border)] px-4 py-3">
              <h2 id="settings-title" className="text-sm font-semibold bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] bg-clip-text text-transparent">Settings</h2>
              <button
                ref={closeBtnRef}
                className="rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                onClick={() => setSettingsOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="p-4 space-y-5">
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-[var(--text-secondary)]">Display</p>
                <div className="flex items-center justify-between gap-4 rounded-md border border-[var(--glass-border)] bg-[var(--card-bg)] px-3 py-2">
                  <div>
                    <div className="text-sm">Silhouette mode</div>
                    <div className="text-xs text-[var(--text-secondary)]">Hide details of the artwork for harder play</div>
                  </div>
                  <button
                    type="button"
                    aria-pressed={settings.silhouette}
                    onClick={() => setSettings((s) => ({ ...s, silhouette: !s.silhouette }))}
                    className={`relative h-6 w-11 rounded-full transition-colors ${settings.silhouette ? 'bg-emerald-500/70' : 'bg-slate-700'}`}
                  >
                    <span className={`absolute left-0.5 top-0.5 inline-block h-5 w-5 rounded-full bg-white transition-transform ${settings.silhouette ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-[var(--text-secondary)]">Suggestions</p>
                <div className="flex items-center justify-between gap-4 rounded-md border border-[var(--glass-border)] bg-[var(--card-bg)] px-3 py-2">
                  <div>
                    <div className="text-sm">Show dropdown</div>
                    <div className="text-xs text-[var(--text-secondary)]">Enable the live suggestions list while typing</div>
                  </div>
                  <button
                    type="button"
                    aria-pressed={settings.suggestions}
                    onClick={() => setSettings((s) => ({ ...s, suggestions: !s.suggestions }))}
                    className={`relative h-6 w-11 rounded-full transition-colors ${settings.suggestions ? 'bg-emerald-500/70' : 'bg-slate-700'}`}
                  >
                    <span className={`absolute left-0.5 top-0.5 inline-block h-5 w-5 rounded-full bg-white transition-transform ${settings.suggestions ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </div>
              <div className="border-t border-[var(--glass-border)] pt-3 text-xs text-[var(--text-secondary)]">
                <p>Hotkeys</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2 py-1">Enter = Submit</span>
                  <span className="rounded border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2 py-1">Tab = Autocomplete</span>
                  <span className="rounded border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2 py-1">Ctrl/Cmd + K = Skip</span>
                </div>
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
