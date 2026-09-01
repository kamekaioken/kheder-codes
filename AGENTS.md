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
Use [Paraglide JS](https://paraglidejs.com/sveltekit)as SvelteKit's official i18n integration