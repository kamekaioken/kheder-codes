import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		order: z.number(),
		translationKey: z.string(),
		wip: z.boolean().default(true),
	}),
});

const legal = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/legal' }),
	schema: z.object({
		title: z.string(),
		route: z.enum(['imprint', 'privacy']),
		order: z.number(),
		kicker: z.string(),
		description: z.string(),
		updated: z.coerce.date(),
	}),
});

export const collections = { blog, legal };
