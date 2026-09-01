import { getCollection } from 'astro:content';
import { pathFor } from './i18n';

export type LegalDocId = 'imprint' | 'privacy';

export type LegalDoc = {
	id: LegalDocId;
	slug: string;
	file: string;
	title: string;
	href: string;
};

/** Impressum and Datenschutzerklärung, in menu order. They exist in German
 *  only, so every locale gets the same paths. */
export async function getLegalDocs(): Promise<LegalDoc[]> {
	const entries = await getCollection('legal');

	return entries
		.toSorted((a, b) => a.data.order - b.data.order)
		.map((entry) => ({
			id: entry.data.route,
			slug: entry.id,
			file: `${entry.id}.md`,
			title: entry.data.title,
			href: pathFor(entry.data.route, 'de'),
		}));
}
