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
  unprefixed (`/ueber-mich`) and English under a translated slug (`/en/about`). Add a route
  there and its menu entry, `hreflang` links and sitemap alternates follow.

## Components
Two layers, one component per file.

- `src/components/ui/terminal/` is a context-free terminal kit: window chrome, prompt,
  typed text, cursor, rows, choices, hint line, plus a `Typewriter` and an `Entrance`
  state helper. These take props only and know nothing about kheder.codes — treat them
  as a library you happen to keep in this repo, and do not import app modules into them.
- `src/components/terminal/` composes that kit into this site's terminal. State lives in
  one `TerminalSession` (`session.svelte.ts`) put into Svelte context by
  `KhederTerminal.svelte`; subcomponents call `getSession()` instead of taking props.
  Only `KhederTerminal.svelte` takes props, typed as `TerminalProps` in `src/lib/terminal.ts`.

## Animations
`<html transition:animate="none">` in `src/layouts/Base.astro` switches off the page-wide
view-transition crossfade, so a navigation only animates genuinely new DOM (the `<section>`
in `Section.astro`). Astro restarts CSS animations on persisted islands during a swap, so
entry animations inside the terminal are gated on an `Entrance` flag that drops the class
once it has played. Never put a bare `animate-*` class on anything that lives inside
`transition:persist`.

## Testing
`pnpm test` builds the site and runs Playwright against `astro preview`. Because
`astro preview` daemonises itself, the server is started from `tests/global-setup.ts`
instead of Playwright's `webServer` helper.

`tests/transitions.spec.ts` records `animationstart` events to prove nothing replays on
navigation. Wait for an entry animation's class to drop (`settled()`) before recording,
otherwise the assertions race the timer.