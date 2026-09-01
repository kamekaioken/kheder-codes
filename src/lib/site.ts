export const site = {
	domain: 'kheder.codes',
	origin: 'https://kheder.codes',
	mail: 'hallo@kheder.codes',
	donnadesk: 'https://www.donnadesk.de',
	github: 'https://github.com/kamekaioken',
	githubLabel: 'github.com/kamekaioken',
	linkedin: 'https://www.linkedin.com/in/marlenkheder',
	linkedinLabel: 'linkedin.com/in/marlenkheder',
} as const;

export const skillGroups = [
	{
		id: 'languages',
		items: ['TypeScript', 'C#', '.NET', 'Angular', 'React', 'Svelte'],
	},
	{ id: 'runtime', items: ['Bun', 'Node.js', 'Next.js', 'Astro', 'Monorepos'] },
	{ id: 'ai', items: ['LiveKit', 'Voice Agents', 'AI Inference'] },
] as const;

type Reference = {
	id: 'hannover' | 'donna' | 'wts' | 'giz';
	name: string;
	href?: string;
};

export const references: readonly Reference[] = [
	{ id: 'hannover', name: 'Hannover Re' },
	{ id: 'donna', name: 'DonnaDesk', href: 'https://www.donnadesk.de' },
	{ id: 'wts', name: 'WTS' },
	{ id: 'giz', name: 'GIZ' },
];
