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

**The terminal is the navigation.** `src/components/terminal/KhederTerminal.svelte` is the
only island. It sits on every route via `src/layouts/Base.astro`, carries
`transition:persist` so its typed state survives client-side navigation, and derives its
selection from the `current` prop. Page content is static Astro markup below it, so every
page is crawlable without JS.

**Two component layers.** `src/components/ui/terminal/` is a context-free terminal kit —
window chrome, prompt, typed text, blinking cursor, rows, ASCII radio choices, hint line —
built to be lifted into any project: props only, no imports from `src/lib`. One component
per file. `src/components/terminal/` composes that kit into this site's terminal, and its
state lives in a single `TerminalSession` (`session.svelte.ts`) that
`KhederTerminal.svelte` puts into Svelte context, so the hero, the window and the submenus
call `getSession()` instead of being handed a dozen props each.

**One animation per navigation.** `<html transition:animate="none">` switches off Astro's
page-wide crossfade, so a navigation animates only what is actually new: the `<section>`
in `Section.astro`. Astro restarts CSS animations on persisted islands during a swap, so
the terminal's and the submenus' entry animations are gated on an `Entrance` flag that
drops the class once it has played, and put back when the element really is new (the hero
closing, a submenu opening). `tests/transitions.spec.ts` records `animationstart` events
to keep it that way.

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
(they work without JS and carry `hreflang`); theme values are buttons. Three separate
signals keep it readable: `❯` marks the focused row, `(•)`/`( )` marks the saved value, and
the accent frame marks where the cursor sits.

**Headings.** Every page has exactly one `<h1>` and it is the heading a reader actually
sees: the wordmark on `/` (what a crawler renders, since `/` starts in the hero phase) and
the design's section heading everywhere else, styled as before but no longer wrapped in a
second, hidden heading.

Key modules:

- `src/lib/i18n.ts` — the localised route table; single source for menu hrefs, `hreflang` and sitemap alternates
- `src/lib/terminal.ts` — builds the menu, labels and settings options for a locale, and owns the island's prop types
- `src/lib/theme.ts` / `src/lib/intro.ts` — storage keys and helpers shared by the island and the inline pre-paint script
- `src/content.config.ts` — blog collection; entries live in `src/content/blog/<locale>/` and pair up through `translationKey`

## Open items from the handoff

The two remaining asset follow-ups (Open Graph image, SVG logo) are tracked in
[issue #1](https://github.com/kamekaioken/kheder-codes/issues/1).
