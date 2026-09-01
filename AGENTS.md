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

## Testing
`pnpm test` builds the site and runs Playwright against `astro preview`. Because
`astro preview` daemonises itself, the server is started from `tests/global-setup.ts`
instead of Playwright's `webServer` helper.