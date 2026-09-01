import { getCollection } from 'astro:content';
import { type Locale, teamMemberPath } from './i18n';

export type TeamMember = {
	slug: string;
	file: string;
	/** The person's name, which is also the page heading. */
	title: string;
	role: string;
	href: string;
	translationKey: string;
};

/** The three of us, in the order the menu lists us. */
export async function getMembers(locale: Locale): Promise<TeamMember[]> {
	const entries = await getCollection('team', ({ id }) =>
		id.startsWith(`${locale}/`),
	);

	return entries
		.toSorted((a, b) => a.data.order - b.data.order)
		.map((entry) => {
			const slug = entry.id.slice(locale.length + 1);
			return {
				slug,
				file: `${slug}.md`,
				title: entry.data.name,
				role: entry.data.role,
				href: teamMemberPath(slug, locale),
				translationKey: entry.data.translationKey,
			};
		});
}

export async function getMemberTranslations(
	translationKey: string,
): Promise<Record<string, string>> {
	const entries = await getCollection(
		'team',
		(entry) => entry.data.translationKey === translationKey,
	);

	return Object.fromEntries(
		entries.map((entry) => {
			const [locale, ...rest] = entry.id.split('/');
			return [locale, teamMemberPath(rest.join('/'), locale as Locale)];
		}),
	);
}
