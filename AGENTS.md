## Development

This repositories package manager is pnpm.

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Git

Since the owner wants to review your generated code diff, do not commit and push to the repository unless you're told to.

## Tests

Write Playwright tests for every change you make using the playwright MCP server.

## Documentation

Use the Astro and Svelte MCP Server and Skills or at least visit these docs before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using Svelte components](https://docs.astro.build/en/guides/integrations-guide/svelte/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

Do not add inline comments to the code if the code is self-explanatory.

## i18n
[Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) provides the messages,
wired up as a Vite plugin (see `astro.config.mjs`) rather than the SvelteKit integration.

- Copy lives in `messages/de.json` and `messages/en.json`; `de` is the base locale.
- `src/paraglide/` is compiler output — generated on build, gitignored, never edited.
- Call messages with an explicit locale: `m.menu_about({}, { locale })`. Middleware also
  sets the ambient locale, but passing it keeps components renderable for either language.
- URLs are owned by `src/lib/i18n.ts`, not by Paraglide's `urlPatterns`: German is served
  unprefixed (`/referenzen`) and English under a translated slug (`/en/references`). Add a
  route there and its menu entry, `hreflang` links and sitemap alternates follow.

## Components
Two layers, one component per file.

- `src/components/ui/terminal/` is a context-free terminal kit: window chrome, prompt,
  typed text, cursor, rows, choices, hint line, plus a `Typewriter` and an `Entrance`
  state helper. These take props only and know nothing about kheder.codes — treat them
  as a library you happen to keep in this repo, and do not import app modules into them.
- `src/components/terminal/` composes that kit into this site's terminal. State lives in a
  `TerminalSession` (`session.svelte.ts`) put into Svelte context by `KhederTerminal.svelte`;
  subcomponents call `getSession()` instead of taking props. Only `KhederTerminal.svelte`
  takes props, typed as `TerminalProps` in `src/lib/terminal.ts`.
- The session holds the page's own facts (menu, route, row cursors, navigation) and composes
  the rest: `boot.svelte.ts` owns the intro choreography (`session.boot`),
  `settings.svelte.ts` the settings submenu (`session.settings`), `dock.svelte.ts` the
  docked panel (`session.dock`), and `keymap.ts` maps keystrokes onto them. Put new state
  in the piece it belongs to, not in the session.
- Every submenu but one is a route: `team/`, `blog/` and `rechtliches/` open because you are
  on that page. Settings has no page at all — its menu row is a button with no `href`, and
  `session.settings.expanded` unfolds the panel over whatever is being read. It is therefore
  the one submenu that is always in the served markup, hidden by `[data-typed]` rather than
  by an `{#if}`: without JavaScript nothing could unfold it and the language links would be
  gone.

## Layout
The page is an IDE shell. From 1080px up the terminal takes a column of its own on
the left and the page reads beside it; below that it lies along the bottom edge and
the page scrolls behind it. Both are pure CSS in `global.css` — `[data-dock]` is only
positioned under `:root[data-js="on"]`, so without JavaScript the panel stays in the
flow as the last block of the document. Lying at the bottom it measures itself into
`--dock-h` and `[data-shell]` keeps that much room free; in its own column the shell
keeps `--dock-w` free on the left instead. Nothing needs its own spacing to clear it.

The column is wide enough (`--dock-w`) that every main-menu row — label plus
description — fits on a single line; keep new menu copy short enough to hold that.

Only the bottom panel can be folded away — through the yellow traffic light, the
chevron, or a click on the title bar — because only there does it cover anything;
`TerminalDock` mirrors the same two media queries in `side` and `compact`. On a phone
it folds itself, staying open only where the menu is still the point — the home screen
and the submenu indexes, listed in `menuIsThePoint` — and leaving anything meant to be
read, a content page or one of the `.md` documents, against the title bar alone;
a manual toggle holds until the route changes. Because the dock never scrolls away,
the arrows drive the menu from the page and are handed back to the browser as soon as
the focus sits inside `[data-content]`.

The intro is an opaque cover over the page (`[data-hero]`, fixed, fading out in the
term phase), not a switch that removes it, so the home copy stays in the rendered
document for crawlers. `boot.syncPhase()` makes `[data-shell]` `inert` for as long as
it is covered, so the keyboard and screen readers cannot wander underneath.

## Headings
The outline belongs to the page, never to the terminal. `Section.astro` renders the one
`<h1>` a document has and a markdown body starts at `<h2>` under it; the terminal carries
the menu and no heading element at all — the wordmark is a `<p>`. `tests/i18n-seo.spec.ts`
holds that line.

Every markdown page — a team profile, an article, a legal document — links the document
before and after it in its own collection through `DocNav.astro`, ordered by the `order`
frontmatter that also orders the submenu.

## Animations
`<html transition:animate="none">` in `src/layouts/Base.astro` switches off the page-wide
view-transition crossfade, so a navigation only animates genuinely new DOM (the `<section>`
in `Section.astro`). Astro restarts CSS animations on persisted islands during a swap, so
entry animations inside the terminal are gated on an `Entrance` flag that drops the class
once it has played. Never put a bare `animate-*` class on anything that lives inside
`transition:persist`.

## Checks
`pnpm check` runs `astro check` (`.astro`/`.ts`), `svelte-check` (the island — `astro check`
does not type-check `.svelte` files), oxlint and a Biome format check. Biome's linter is off
by design; oxlint is the linter.

## Testing
`pnpm test` builds the site and runs Playwright against `astro preview`. Because
`astro preview` daemonises itself, the server is started from `tests/global-setup.ts`
instead of Playwright's `webServer` helper.

`tests/transitions.spec.ts` records `animationstart` events to prove nothing replays on
navigation. Wait for an entry animation's class to drop (`settled()`) before recording,
otherwise the assertions race the timer.