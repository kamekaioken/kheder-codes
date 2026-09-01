// @ts-check
import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.kheder.codes',
	output: 'static',
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Montserrat',
			cssVariable: '--font-montserrat',
			weights: [800],
			styles: ['normal'],
			subsets: ['latin'],
			fallbacks: ['sans-serif'],
		},
	],
	i18n: {
		defaultLocale: 'de',
		locales: ['de', 'en'],
		routing: {
			prefixDefaultLocale: false,
		},
	},
	integrations: [
		svelte(),
		sitemap({
			i18n: {
				defaultLocale: 'de',
				locales: { de: 'de-DE', en: 'en-US' },
			},
		}),
	],
	vite: {
		plugins: [
			tailwindcss(),
			paraglideVitePlugin({
				project: './project.inlang',
				outdir: './src/paraglide',
				emitTsDeclarations: true,
				strategy: ['url', 'globalVariable', 'baseLocale'],
				urlPatterns: [
					{
						pattern: '/:path(.*)?',
						localized: [
							['en', '/en/:path(.*)?'],
							['de', '/:path(.*)?'],
						],
					},
				],
			}),
		],
	},
});
