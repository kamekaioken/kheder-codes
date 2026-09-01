import { getCollection } from 'astro:content';
import { blogPostPath, type Locale } from './i18n';

export type BlogEntry = {
	slug: string;
	file: string;
	title: string;
	href: string;
	translationKey: string;
	wip: boolean;
};

export async function getPosts(locale: Locale): Promise<BlogEntry[]> {
	const entries = await getCollection('blog', ({ id }) =>
		id.startsWith(`${locale}/`),
	);

	return entries
		.toSorted((a, b) => a.data.order - b.data.order)
		.map((entry) => {
			const slug = entry.id.slice(locale.length + 1);
			return {
				slug,
				file: `${slug}.md`,
				title: entry.data.title,
				href: blogPostPath(slug, locale),
				translationKey: entry.data.translationKey,
				wip: entry.data.wip,
			};
		});
}

export async function getPostTranslations(
	translationKey: string,
): Promise<Record<string, string>> {
	const entries = await getCollection(
		'blog',
		(entry) => entry.data.translationKey === translationKey,
	);

	return Object.fromEntries(
		entries.map((entry) => {
			const [locale, ...rest] = entry.id.split('/');
			return [locale, blogPostPath(rest.join('/'), locale as Locale)];
		}),
	);
}
