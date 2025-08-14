import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pokémon Quiz',
  description: 'Guess the Pokémon by image with silhouette and generation filters.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 antialiased min-h-dvh">
        <header className="border-b border-slate-800/70 backdrop-blur supports-[backdrop-filter]:bg-slate-950/40 sticky top-0 z-10">
          <div className="mx-auto max-w-screen-md px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-tight select-none">
              Pokémon Quiz
            </h1>
            <span className="text-slate-400 text-xs">v0</span>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">{children}</main>
        <footer className="mx-auto max-w-screen-md px-4 py-6 text-xs text-slate-400 border-t border-slate-800">
          Pokémon and all respective properties are trademarks of their owners. Fan project, non‑commercial.
        </footer>
      </body>
    </html>
  )
}
