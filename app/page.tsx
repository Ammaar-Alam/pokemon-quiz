'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function HomePage() {
  // Temporary static example image (Charizard id: 6)
  const [silhouette, setSilhouette] = useState(false)

  return (
    <section className="flex flex-col items-center gap-6">
      <div className="w-full max-w-sm aspect-square bg-slate-900/60 rounded-xl grid place-items-center overflow-hidden">
        <Image
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
          alt="Pokémon artwork"
          width={480}
          height={480}
          className={
            silhouette
              ? 'brightness-0 saturate-100 drop-shadow-[0_0_2px_rgba(255,255,255,0.25)]'
              : ''
          }
          priority
        />
      </div>

      <div className="w-full max-w-sm flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            className="h-4 w-4 accent-slate-500"
            checked={silhouette}
            onChange={(e) => setSilhouette(e.target.checked)}
          />
          Silhouette mode
        </label>
      </div>

      <div className="w-full max-w-sm">
        <input
          type="text"
          placeholder="Type a Pokémon name..."
          className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-600"
          aria-label="Guess Pokémon"
        />
        <p className="mt-2 text-xs text-slate-400">
          Type to guess. Autocomplete and game logic will be added next.
        </p>
      </div>
    </section>
  )
}

