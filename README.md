# kheder.codes

Terminal-style site for KHEDER.codes — Kheder, Alan and Andrej, three software developers
from Nuremberg. Built with Astro, one Svelte island for the terminal, Tailwind 4 for the
design tokens, and Paraglide JS for German/English.

## Commands

| Command          | Action                                                        |
| :--------------- | :------------------------------------------------------------ |
| `pnpm install`   | Install dependencies                                          |
| `pnpm dev`       | Dev server on `localhost:4321` (add `--background` to detach)  |
| `pnpm build`     | Build to `./dist/`                                            |
| `pnpm preview`   | Serve the build                                               |
| `pnpm test`      | Build, then run the Playwright suite                          |
| `pnpm check`     | `astro check` + `svelte-check` + oxlint + Biome format check   |

## Routes

German is served unprefixed, English under `/en` with translated slugs.

| Page      | German            | English            |
| :-------- | :---------------- | :----------------- |
| Home      | `/`               | `/en/`             |
| Team      | `/team`           | `/en/team`         |
| Profile   | `/team/[slug]`    | `/en/team/[slug]`  |
| Blog      | `/blog`           | `/en/blog`         |
| Article   | `/blog/[slug]`    | `/en/blog/[slug]`  |
| Reference | `/referenzen`     | `/en/references`   |
| Contact   | `/kontakt`        | `/en/contact`      |
| Legal     | `/rechtliches`    | German only        |

`donnadesk ↗` is an external link, and settings is a terminal panel — neither is a route.

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
state lives in a `TerminalSession` (`session.svelte.ts`) that `KhederTerminal.svelte` puts
into Svelte context, so the hero, the window and the submenus call `getSession()` instead of
being handed a dozen props each. The session keeps the page's own facts — menu, route, row
cursors, navigation — and composes the rest: `session.boot` (`boot.svelte.ts`) runs the
intro, `session.settings` (`settings.svelte.ts`) is the settings submenu, and `keymap.ts`
maps keystrokes onto both.

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

**Settings has no page.** Its menu row is a button rather than a link, and it unfolds a
panel over whatever you were reading — the URL does not move, and `⎋` folds it away again.
`↑↓` picks a row, `←→` moves the value cursor, `⏎` applies. Language values are real anchors
(they work without JS, carry `hreflang` and land on the counterpart of the page you are on);
theme values are buttons. Three separate signals keep it readable: `❯` marks the focused row,
`(•)`/`( )` marks the saved value, and the accent frame marks where the cursor sits. Because
nothing could unfold the panel without JS, it is always in the served markup and merely
hidden by CSS.

**Headings belong to the page, not to the terminal.** Every page has exactly one `<h1>`,
rendered by `Section.astro` inside `<main>`; a markdown body starts its own outline at
`<h2>` beneath it. The terminal beside it carries the menu and no heading element at all —
the wordmark is a `<p>`.

**Every markdown page points at its neighbours.** Team profiles, articles and legal
documents each link the document before and after them in their own collection
(`DocNav.astro`), in the same order the terminal submenu lists them.

Key modules:

- `src/lib/i18n.ts` — the localised route table; single source for menu hrefs, `hreflang` and sitemap alternates
- `src/lib/terminal.ts` — builds the menu, labels and settings options for a locale, and owns the island's prop types
- `src/lib/theme.ts` / `src/lib/intro.ts` — storage keys and helpers shared by the island and the inline pre-paint script
- `src/lib/docs.ts` — the previous/next neighbours of a markdown page within its collection
- `src/content.config.ts` — the `blog`, `team` and `legal` collections; blog and team entries live under `src/content/<collection>/<locale>/` and pair up through `translationKey`
