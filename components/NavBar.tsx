"use client"
import Link from 'next/link'
import { ExternalLinkIcon } from '@/components/Icons'

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2C6.476 2 2 6.59 2 12.253c0 4.51 2.865 8.328 6.839 9.678.5.094.682-.221.682-.492 0-.242-.009-.884-.014-1.737-2.782.616-3.369-1.37-3.369-1.37-.455-1.178-1.11-1.492-1.11-1.492-.908-.637.07-.624.07-.624 1.004.072 1.533 1.06 1.533 1.06.892 1.565 2.341 1.113 2.91.851.091-.663.35-1.114.636-1.37-2.222-.259-4.556-1.138-4.556-5.063 0-1.118.389-2.033 1.029-2.75-.104-.26-.446-1.303.098-2.715 0 0 .84-.276 2.75 1.05a9.334 9.334 0 0 1 2.504-.343c.849.004 1.705.117 2.504.343 1.91-1.326 2.748-1.05 2.748-1.05.546 1.412.203 2.455.1 2.715.64.717 1.028 1.632 1.028 2.75 0 3.935-2.338 4.801-4.566 5.056.359.32.679.948.679 1.912 0 1.38-.013 2.496-.013 2.835 0 .273.18.59.688.49C19.138 20.577 22 16.76 22 12.253 22 6.59 17.523 2 12 2Z" />
    </svg>
  )
}

export function NavBar() {
  return (
    <nav className="sticky top-0 z-20 border-b border-[var(--glass-border)] bg-[var(--nav-bg)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="select-none text-base sm:text-lg font-semibold">
          <span
            className="bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] bg-clip-text text-transparent drop-shadow-[0_0_15px_var(--glowing-cyan-glow)]"
          >
            Pokémon Quiz
          </span>
        </Link>
        <div className="hidden sm:flex items-center gap-2">
          <a
            className="inline-flex items-center gap-2 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--primary)] transition"
            href="https://ammaaralam.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Portfolio"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            Portfolio
          </a>
          {/* Settings access is available inside the page; navbar button removed for simplicity */}
          <a
            className="inline-flex items-center gap-2 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--primary)] transition"
            href="https://github.com/Ammaar-Alam/pokemon-quiz"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Repository"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub
          </a>
        </div>
        {/* Mobile: icon-only actions */}
        <div className="flex sm:hidden items-center gap-2">
          <a
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--primary)] transition"
            href="https://ammaaralam.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Portfolio"
            aria-label="Portfolio"
          >
            <ExternalLinkIcon className="h-4 w-4" />
          </a>
          {/* Mobile settings button removed; in-page settings remains */}
          <a
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--primary)] transition"
            href="https://github.com/Ammaar-Alam/pokemon-quiz"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Repository"
            aria-label="GitHub Repository"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
              <path d="M12 2C6.476 2 2 6.59 2 12.253c0 4.51 2.865 8.328 6.839 9.678.5.094.682-.221.682-.492 0-.242-.009-.884-.014-1.737-2.782.616-3.369-1.37-3.369-1.37-.455-1.178-1.11-1.492-1.11-1.492-.908-.637.07-.624.07-.624 1.004.072 1.533 1.06 1.533 1.06.892 1.565 2.341 1.113 2.91.851.091-.663.35-1.114.636-1.37-2.222-.259-4.556-1.138-4.556-5.063 0-1.118.389-2.033 1.029-2.75-.104-.26-.446-1.303.098-2.715 0 0 .84-.276 2.75 1.05a9.334 9.334 0 0 1 2.504-.343c.849.004 1.705.117 2.504.343 1.91-1.326 2.748-1.05 2.748-1.05.546 1.412.203 2.455.1 2.715.64.717 1.028 1.632 1.028 2.75 0 3.935-2.338 4.801-4.566 5.056.359.32.679.948.679 1.912 0 1.38-.013 2.496-.013 2.835 0 .273.18.59.688.49C19.138 20.577 22 16.76 22 12.253 22 6.59 17.523 2 12 2Z" />
            </svg>
          </a>
        </div>
      </div>
    </nav>
  )
}
