/** What every markdown page needs to point at its neighbours: the file name the
 *  terminal lists it under, the human title and where it lives. */
export type DocRef = {
	file: string;
	title: string;
	href: string;
};

export type DocNeighbours = {
	prev: DocRef | null;
	next: DocRef | null;
};

/** The document before and after `file` in its own collection, in menu order.
 *  Either end of the list simply has none. */
export function neighboursOf(
	docs: readonly DocRef[],
	file: string,
): DocNeighbours {
	const index = docs.findIndex((doc) => doc.file === file);
	if (index < 0) return { prev: null, next: null };

	return {
		prev: docs[index - 1] ?? null,
		next: docs[index + 1] ?? null,
	};
}
