# Pokémon Quiz (MVP scaffold)

This is the MVP scaffold for the Pokémon Quiz web app (Next.js + TypeScript + Tailwind CSS).

- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm start`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Build index (first run): `npm run build:index`

Notes
- Remote images are allowed for official artwork from raw.githubusercontent.com (see `next.config.ts`).
- Global dark theme is enabled; Tailwind is configured with class strategy (`dark`).
- Generate the Pokémon index once via `npm run build:index` to enable suggestions and gameplay.

See `ROADMAP.md` for the phased implementation plan.

Deployment (GitHub Pages)
- This project is configured for static export (Next `output: 'export'`).
- Build the site: `npm run build` (outputs to `out/`).
- The build adds `out/.nojekyll` for GitHub Pages.
- Publish `out/` to GitHub Pages (e.g., set Pages to deploy from `gh-pages` branch and push `out/` contents there).
- If deploying to a repository subpath (e.g., `https://user.github.io/repo`), set Next `basePath` and `assetPrefix` accordingly in `next.config.ts`.
