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
      <body className="bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-900 text-slate-100 antialiased min-h-dvh flex flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-800/70 bg-slate-950/60 backdrop-blur supports-[backdrop-filter]:bg-slate-950/40">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-lg font-semibold tracking-tight select-none">Pokémon Quiz</h1>
              <nav className="hidden sm:flex items-center gap-4">
                <a 
                  href="https://ammaaralam.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Portfolio
                </a>
                <a 
                  href="https://github.com/Ammaar-Alam" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  GitHub
                </a>
                <a 
                  href="https://ammaar.xyz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Photography
                </a>
              </nav>
            </div>
            <span className="text-slate-400 text-xs">v0</span>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center mx-auto max-w-4xl lg:max-w-5xl px-3 sm:px-4 py-4 md:py-8 w-full">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-6 text-xs text-slate-400 border-t border-slate-800 w-full">
          Pokémon and all respective properties are trademarks of their owners. Fan project, non‑commercial.
        </footer>
      </body>
    </html>
  )
}
