# kheder.codes

Terminal-style portfolio for Kheder — freelance software developer, Nuremberg.
Built with Astro, one Svelte island for the terminal, Tailwind 4 for the design tokens,
and Paraglide JS for German/English.

The design source of truth is `design_handoff_kheder_codes/` (HTML prototype, screenshots,
token table). It is a reference bundle, not code, and is excluded from linting/formatting.

## Commands

| Command          | Action                                                        |
| :--------------- | :------------------------------------------------------------ |
| `pnpm install`   | Install dependencies                                          |
| `pnpm dev`       | Dev server on `localhost:4321` (add `--background` to detach)  |
| `pnpm build`     | Build to `./dist/`                                            |
| `pnpm preview`   | Serve the build                                               |
| `pnpm test`      | Build, then run the Playwright suite                          |
| `pnpm check`     | `astro check` + oxlint + Biome format check                   |

## Routes

German is served unprefixed, English under `/en` with translated slugs.

| Page      | German            | English         |
| :-------- | :---------------- | :-------------- |
| Home      | `/`               | `/en/`          |
| About     | `/ueber-mich`     | `/en/about`     |
| Blog      | `/blog`           | `/en/blog`      |
| Article   | `/blog/[slug]`    | `/en/blog/[slug]` |
| Reference | `/referenzen`     | `/en/references` |
| Contact   | `/kontakt`        | `/en/contact`   |
| Settings  | `/einstellungen`  | `/en/settings`  |

`donnadesk ↗` is an external link, not a route.

## How it fits together

**The terminal is the navigation.** `src/components/Terminal.svelte` is the only island. It
sits on every route via `src/layouts/Base.astro`, carries `transition:persist` so its typed
state survives client-side navigation, and derives its selection from the `current` prop.
Page content is static Astro markup below it, so every page is crawlable without JS.

**Progressive reveal without hiding content.** The intro typing, the staggered menu reveal and
the hero/terminal swap are all driven by `data-*` attributes plus CSS in
`src/styles/global.css`, never by removing nodes. An inline script (`ThemeInit.astro`) sets
`data-js="on"` before first paint; the reveal rules are scoped to that flag, so a client
without JS receives the full wordmark, the whole menu and all copy. The intro is skipped on
repeat visits within a session via `sessionStorage`.

**Theme.** Colour tokens use CSS `light-dark()`, so light/dark live in one declaration. The
override is `color-scheme: only light|dark` driven by `data-theme` on `<html>`, written before
first paint from `localStorage` and re-applied on `astro:after-swap`. `system` removes the
attribute and follows the OS.

**Settings** (`/einstellungen`) is an inline terminal submenu in the same pattern as `blog/`:
`↑↓` picks a row, `←→` moves the value cursor, `⏎` applies. Language values are real anchors
(they work without JS and carry `hreflang`); theme values are buttons.

Key modules:

- `src/lib/i18n.ts` — the localised route table; single source for menu hrefs, `hreflang` and sitemap alternates
- `src/lib/terminal.ts` — builds the menu, labels and settings options for a locale
- `src/lib/theme.ts` — theme storage keys and helpers shared by the island and the inline script
- `src/content.config.ts` — blog collection; entries live in `src/content/blog/<locale>/` and pair up through `translationKey`

## Open items from the handoff

- The logo ships only as `logo.png` (1748×1240, black on transparent), inverted in dark mode
  per the token table. An SVG would render more crisply in the 34px footer slot.
- No Open Graph image yet — `og:image` is unset and cards fall back to `summary`. Deriving one
  from the wordmark is listed as a production follow-up in the handoff.
- On `/` after the intro, the only `<h1>` (the wordmark) is inside the hidden hero. Subpages
  carry a visually-hidden `<h1>` above the design's `<h2>`.
