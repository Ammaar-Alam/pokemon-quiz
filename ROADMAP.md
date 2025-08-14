# Pokémon Quiz — Product & Engineering Roadmap (v1)

Status: Proposal for approval
Owner: You (product) • Engineering: this repo
Primary goal: Ship a fast, accessible, mobile‑first “Guess the Pokémon” quiz with typeahead, silhouette mode, and generation filters.

This roadmap is designed so any contributor can implement features without guessing. It defines phases, acceptance criteria, stack choices, file layout, data shape, testing, and deployment.

Note on trademarks: “Pokémon” and character names are trademarks of their respective owners. This is a fan project for educational/fair‑use purposes. No commercial use.

---

## 0) Product Vision & Non‑Goals

- Vision: A single‑page web app where users see a Pokémon image and guess its name via a typeahead input. Features include optional silhouette mode and generation filters (Gen I–IX). It should feel instant, look polished, and work great on phones.
- MVP users: Casual fans and speedrunners who want a simple, fast challenge.
- Non‑goals (v1): Accounts, leaderboards, social graph, multi‑language UI, server‑side databases, ads/analytics beyond basic privacy‑friendly metrics.

---

## 1) High‑Level Architecture

- Client‑only app with static generation (no server database). Data needed at runtime: list of Pokémon, image URLs, generation mapping.
- Source of truth: PokeAPI for species list and generation membership. At build time we generate a compact index JSON that the app loads at runtime.
- Images: Use official artwork CDN: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png`
- Silhouette mode: CSS filters (no preprocessing required).
- Persistence: LocalStorage for user settings (e.g., selected generations, silhouette preference) and optional streak counter.

Stack choices (opinionated for clarity):
- Framework: Next.js 14 (App Router), React 18, TypeScript 5
- Styling: Tailwind CSS
- Search: Fuse.js for fuzzy, typo‑tolerant typeahead
- Tests: Vitest + Testing Library (unit), Playwright (e2e)
- Lint/Format: ESLint (next/core-web-vitals), Prettier
- Node: 20 LTS
- Hosting: Vercel (or any static host)

Rationale: Next.js gives instant scaffolding, good DX, built‑in image optimization if desired, and easy deploys. We keep a client‑centric model to avoid backend complexity.

---

## 2) Detailed Feature Specification (MVP)

Core loop
- On load, app reads settings (selected generations, silhouette on/off). If none, default `gens=[1..9]`, `silhouette=false`.
- App loads a static `pokemon.index.json` (~1–2 MB) containing: id, displayName, canonicalName, generation, aliases.
- Filter candidates to selected generations; pick 1 at random; render image; input below.
- User types; suggestions update live; user submits guess (Enter) or picks from list.
- If correct (canonical match), show success UI; provide Next button; increment streak.

Typeahead behavior
- Debounced input (150ms). Case/diacritics/punctuation‑insensitive matching.
- Show top 7 suggestions. Keyboard nav: Up/Down selects, Enter confirms.
- Use Fuse.js with fields: `displayName`, `aliases` and sensible threshold (0.3) to allow mild typos.

Answer correctness rules
- Canonicalization removes diacritics, spaces, punctuation, gender symbols. Examples accepted:
  - "Mr. Mime" ⇔ "mr mime", "mrmime"
  - "Farfetch’d" ⇔ "farfetchd"
  - "Nidoran♀/♂" ⇔ "nidoran f", "nidoran m"
  - "Porygon-Z" ⇔ "porygonz"
  - Hyphen/space variants (e.g., "Ho-Oh" ⇔ "hooh")
- Correct when canonical guess equals target’s canonicalName or any alias.

Images
- Primary: official-artwork PNG by Pokémon id.
- Fallbacks if needed: dream-world SVG where available; otherwise sprite PNG.
- Preload next target’s image when user is close to answering or after reveal.

Silhouette mode
- Apply CSS filter to image container: `brightness(0) saturate(100%)` for blackout. Optionally combine with `contrast(100%)`.
- A thin white outline can be added via drop-shadow for visibility on dark backgrounds.

Settings
- Drawer/modal with:
  - Silhouette toggle (default off)
  - Generation multi-select (1–9, default all)
  - Exclude regional forms (default true for MVP)
  - Save to LocalStorage with key `pq.settings.v1`

Feedback & controls
- Visual correctness indication (green check + target name on success)
- Buttons: Reveal (shows answer, zeroes streak) and Next
- HUD: Current streak, last result status

Accessibility (A11y)
- Input implements ARIA combobox pattern; listbox options are labeled and keyboard navigable.
- Sufficient color contrast; focus outlines; screen reader text for results.

Performance
- 60 FPS interactions; input processing debounced.
- Lazy load images; preload next image.

---

## 3) Data Model & Build‑Time Index

`data/pokemon.index.json` entry shape (each line is a concrete field):
```
{
  "id": 6,                       // numeric Pokémon id
  "displayName": "Charizard",   // preferred display
  "canonicalName": "charizard", // normalized for comparisons
  "generation": 1,               // 1..9
  "aliases": [                   // canonicalized equivalents
    "lizardon"                   // optional English/alt names if desired
  ]
}
```

Generation derivation (build script):
- Use PokeAPI `/api/v2/generation/{1..9}` to collect `pokemon_species` names; map species to gen.
- Resolve `id` by following `pokemon-species` to find default variety’s `pokemon` id.
- Build `displayName` from species English name; compute `canonicalName`; generate sensible `aliases` for punctuation/diacritics/gender variants.

Runtime usage:
- Load once on app start; memoize; filter by settings; pick random by `Math.random()` (or a small seeded RNG for future “Daily”).

---

## 4) UI/UX Design Spec (MVP)

Layout (mobile‑first)
- Header: title “Pokémon Quiz”, a gear icon to open Settings.
- Main: image container centered; below it, typeahead input with suggestions.
- Footer: small trademark disclaimer.

Sizing
- Image container: 320×320 (mobile), 480×480 (tablet+), object‑contain, background subtle gradient.
- Input: full width up to 480px; sticky near bottom on mobile for thumb reach.

Color & type
- Palette: 
  - Primary: `#3466AF` (blue), Accent: `#FFCB05` (gold), Success: `#22C55E`, Error: `#EF4444`, Surface: `#0B1020` (dark) with light mode later.
  - Text on dark: `#E6E8EE`
- Font: Inter (system fallback ok). Base size 16px; scale 12, 14, 16, 20, 24.

Components
- `PokemonImage`: receives `id`, `silhouette` boolean. Renders `next/image` with remotePatterns; applies filters.
- `TypeaheadInput`: controlled input + suggestions list; exposes `onSubmit(name)`.
- `SettingsDrawer`: toggles and multi-select with checkboxes for gens 1–9.
- `GameHud`: shows streak, correctness, controls (Reveal/Next).

Empty/error states
- If index fails to load: show retry and note “App works offline once data is cached.”
- If image fails: swap to fallback sprite and continue.

---

## 5) Technical Implementation Plan

Phase 1 — Project Scaffold (1 day)
- Create Next.js (TypeScript) app with App Router.
- Add Tailwind, ESLint (next/core-web-vitals), Prettier, Vitest + Testing Library, Playwright.
- Configure `next.config.js` `images.remotePatterns` to allow `raw.githubusercontent.com` and `pokeapi.co` if needed.
- Add basic layout and dark theme.

Acceptance:
- `npm run dev` serves a blank home with header/footer; lint/typecheck/test all pass.

Phase 2 — Data Index Pipeline (1–2 days)
- Script `scripts/build-pokemon-index.ts` that fetches PokeAPI generations 1–9, resolves species → default Pokémon id, computes fields, writes `data/pokemon.index.json`.
- Add canonicalization util: strip diacritics, lowercase, remove spaces/punctuation, map gender symbols, drop dots and hyphens.
- Check in the generated JSON to the repo (derived artifact) to avoid runtime API dependency/rate limits.

Acceptance:
- Running `npm run build:index` regenerates `data/pokemon.index.json` with ~(count of species) entries covering gens 1–9.
- Unit tests validate canonicalization and a sample of tricky names.

Phase 3 — Game Core (1–2 days)
- Implement game state: load settings, load index, compute candidate pool, pick random target, render image.
- Implement `TypeaheadInput` with Fuse.js and keyboard nav.
- Implement correctness check and success UI with Next button; implement Reveal.
- Persist settings (LocalStorage) under `pq.settings.v1` and a `pq.progress.v1` for streak.

Acceptance:
- Guess flow works end‑to‑end; silhouette toggle changes image instantly; generation filter affects target selection.

Phase 4 — Polish & A11y (1 day)
- ARIA combobox/listbox semantics; focus management; screen reader announcements on result.
- Preload next image; debounce search; measure bundle size.

Acceptance:
- Keyboard‑only playthrough; Lighthouse a11y ≥ 95 on mobile.

Phase 5 — Tests & E2E (1 day)
- Unit tests: canonicalization, filtering by gen, RNG uniqueness window, typeahead ranking.
- E2E (Playwright): happy path correct guess, reveal flow, settings persistence.

Acceptance:
- `npm test` and `npm run e2e` pass in CI.

Phase 6 — Release (0.5 day)
- Add disclaimer in footer, README usage notes, and deploy to Vercel.

Acceptance:
- Public URL live; smoke tests green.

Future Phases (post‑MVP)
- Timed mode and leaderboards (local first, opt‑in remote later)
- Daily challenge (seeded RNG by date)
- Hard mode: silhouette only, limited guesses, no suggest list
- Multilingual display names; locale data index
- PWA offline mode; cache recent images; add install prompt
- Advanced filters: include/exclude legendaries, shiny art toggle

---

## 6) File/Folder Layout

```
pokemon-quiz/
├─ app/
│  ├─ layout.tsx
│  └─ page.tsx                     // main game screen
├─ components/
│  ├─ GameHud.tsx
│  ├─ PokemonImage.tsx
│  ├─ SettingsDrawer.tsx
│  └─ TypeaheadInput.tsx
├─ lib/
│  ├─ canon.ts                     // normalization utils
│  ├─ indexLoader.ts               // loads and caches pokemon.index.json
│  ├─ rng.ts                       // random target helpers
│  └─ storage.ts                   // LocalStorage helpers
├─ data/
│  └─ pokemon.index.json           // generated artifact (committed)
├─ scripts/
│  └─ build-pokemon-index.ts       // build-time script
├─ styles/
│  └─ globals.css
├─ tests/
│  ├─ canon.test.ts
│  ├─ typeahead.test.tsx
│  └─ e2e/
│     └─ game.spec.ts
├─ next.config.js
├─ tailwind.config.ts
├─ package.json
└─ README.md
```

Note: Repo root here already exists; we’ll create the above structure inside the project when we scaffold.

---

## 7) Algorithms & Utilities

Canonicalization `canon(text: string): string`
- Lowercase, NFKD normalize, strip diacritics, remove spaces/punctuation, replace `♀ → f`, `♂ → m`, drop `.` and `-`.
- Examples:
  - `Mr. Mime` → `mrmime`
  - `Farfetch’d` → `farfetchd`
  - `Nidoran♀` → `nidoranf`
  - `Ho-Oh` → `hooh`

Alias generation (build‑time)
- Create alias for punctuation‑stripped form, hyphenless, space‑less, gender replacement forms, and common variants.

Target selection
- Compute `pool = index.filter(gen in selectedGens)`; pick `pool[Math.floor(Math.random()*pool.length)]`.
- Optional future: avoid last N repeats via ring buffer kept in LocalStorage.

Typeahead ranking
- Fuse.js fields: `displayName` (weight 0.7), `aliases` (0.3); threshold 0.3; distance 100.
- Show top 7 unique species.

---

## 8) Testing Strategy

Unit (Vitest)
- `canon.test.ts`: round‑trip tricky names; property tests for punctuation removal.
- `indexLoader.test.ts`: ensures JSON parses and generations in range 1..9.
- `typeahead.test.tsx`: suggestion ordering and keyboard navigation.

Integration
- Game flow: from load to correct guess and next.

E2E (Playwright)
- Loads, guesses "charizard" correctly with silhouette on.
- Reveal flow resets streak; settings persist across reload.

Coverage
- Aim ≥ 80% lines on lib and components core to the loop.

CI
- Jobs: install, lint, typecheck, unit tests, e2e (headed false), build.

---

## 9) Performance, A11y, i18n, Security

Performance
- Debounce input; limit suggestions to 7; memoized Fuse index.
- Preload next image after correctness or when top suggestion confidence > threshold.

A11y
- ARIA combobox with listbox; proper roles/ids; visible focus rings.

i18n (later)
- MVP: English names. Plan: add `displayNameByLocale` and a locale selector; per‑locale indices.

Security & Privacy
- No secrets. No third‑party trackers. LocalStorage only for preferences and streak.

Legal
- Footer text: “Pokémon and all respective properties are trademarked by their respective owners. This is a fan project, non‑commercial.”

---

## 10) Deployment & Operations

- Environment: no required env vars for MVP.
- `next.config.js` images remotePatterns allow:
  - `raw.githubusercontent.com`
  - `pokeapi.co` (if fetching at runtime for any reason)
- Deploy: Vercel. Preview deployments on PRs; production on main branch.

---

## 11) Developer Workflow

Node & package scripts
- Node 20.x recommended.
- Scripts (to be added during scaffold):
  - `dev`: run Next dev server
  - `build`: Next build
  - `start`: Next start
  - `lint`: eslint .
  - `typecheck`: tsc --noEmit
  - `test`: vitest run
  - `test:watch`: vitest
  - `e2e`: playwright test
  - `build:index`: tsx scripts/build-pokemon-index.ts

Code style
- ESLint + Prettier; Tailwind class sorting optional.

PR checklist
- Lint/typecheck/tests pass; screenshots for UI changes; demonstrate keyboard nav; add/update docs.

---

## 12) Backlog: Tickets with Acceptance Criteria

MVP
1. Scaffold Next.js TS app
   - AC: Dev server runs; baseline page renders; ESLint/Prettier configured.
2. Add Tailwind and base theme
   - AC: Global styles; dark surface; responsive container.
3. Configure remote images
   - AC: next.config allows official-artwork domain; sample image renders.
4. Canonicalization util
   - AC: Tests pass on tricky names (Mr. Mime, Farfetch’d, Nidoran♀/♂, Porygon‑Z, Ho‑Oh).
5. Build index script
   - AC: `data/pokemon.index.json` generated with gens 1–9; committed.
6. Index loader + settings storage
   - AC: Index loads once; settings read/write from LocalStorage.
7. Typeahead input with Fuse.js
   - AC: Live suggestions; keyboard nav; selection via Enter/Click.
8. Game core flow
   - AC: Random target from selected gens; correct guess detection; Next/Reveal work; streak updates.
9. Silhouette mode
   - AC: Toggle hides details via CSS filters; verified on multiple sprites.
10. A11y polish
   - AC: Proper ARIA roles; tab/arrow keys; Lighthouse a11y ≥ 95.
11. Unit & e2e tests
   - AC: vitest + Playwright suites pass in CI.
12. Deploy to Vercel
   - AC: Public URL live; smoke test green.

Post‑MVP (prioritized)
13. Daily challenge (seeded RNG)
14. Timer mode + local leaderboard
15. PWA offline + prefetch recent images
16. Advanced filters (legendaries, starters, regionals)
17. Multi‑locale names

---

## 13) Risks & Mitigations

- PokeAPI rate limiting during index build → Cache results; check in generated JSON; run builds sparingly.
- Official artwork missing for edge cases → Implement fallback chain (dream‑world, regular sprite).
- Name matching edge cases → Expand alias rules; keep tests for known tricky species.
- Bundle size from Fuse index → Keep JSON compact; build Fuse index on client once; limit suggestions.

---

## 14) Open Items for Confirmation

Please review and confirm or adjust:
1. Tech stack: Next.js + TS + Tailwind + Fuse.js (vs. simpler Vite React).
2. MVP scope: silhouette toggle, gen filters (1–9), typeahead with typo tolerance, streak only (no timers/leaderboards yet).
3. Visual style: dark theme first with the specified palette; light mode later.
4. Deployment: Vercel previews and production on `main`.
5. Legal disclaimer text in footer.

Once approved, we’ll scaffold the project and implement Phase 1.

