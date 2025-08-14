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
      <body className="bg-slate-950 text-slate-100 antialiased min-h-dvh">
        <header className="border-b border-slate-800">
          <div className="mx-auto max-w-screen-md px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-tight">Pokémon Quiz</h1>
            <span className="text-slate-400 text-sm">MVP</span>
          </div>
        </header>
        <main className="mx-auto max-w-screen-md px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-screen-md px-4 py-6 text-xs text-slate-400 border-t border-slate-800">
          Pokémon and all respective properties are trademarks of their owners. Fan project, non‑commercial.
        </footer>
      </body>
    </html>
  )
}

