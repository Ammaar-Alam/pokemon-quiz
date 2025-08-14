import './globals.css'
import type { Metadata } from 'next'
import { NavBar } from '@/components/NavBar'

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
      <body className="text-slate-100 antialiased min-h-dvh flex flex-col">
        <NavBar />
        <main className="flex-1 flex items-center justify-center mx-auto max-w-4xl lg:max-w-5xl px-3 sm:px-4 py-4 md:py-8 w-full">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-6 text-xs text-slate-400 border-t border-slate-800 w-full">
          Pokémon and all respective properties are trademarks of their owners. Fan project, non‑commercial.
        </footer>
      </body>
    </html>
  )
}
