export const site = {
	domain: 'kheder.codes',
	origin: 'https://www.kheder.codes',
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
		items: ['TypeScript', 'C#', '.NET', 'Angular', 'Svelte', 'React'],
	},
	{
		id: 'runtime',
		items: ['Bun', 'Node.js', 'Astro', 'SvelteKit', 'Nx', 'Pulumi'],
	},
	{ id: 'ai', items: ['LiveKit', 'Voice Agents', 'Realtime Audio'] },
] as const;

export type ReferenceId = 'donna' | 'hannover' | 'giz' | 'wts' | 'dzr';

type Reference = {
	id: ReferenceId;
	name: string;
	href?: string;
	/** What the project was actually built with, trimmed to what still says
	 *  something — no version numbers, and no tooling for its own sake. */
	stack: readonly string[];
};

export const references: readonly Reference[] = [
	{
		id: 'donna',
		name: 'DonnaDesk GmbH',
		href: 'https://www.donnadesk.de',
		stack: [
			'TypeScript',
			'Bun',
			'Elysia',
			'LiveKit',
			'SvelteKit',
			'Astro',
			'Supabase',
			'Pulumi',
		],
	},
	{
		id: 'hannover',
		name: 'Hannover Rück SE',
		stack: [
			'C#',
			'.NET',
			'Angular',
			'TypeScript',
			'Nx',
			'Micro Frontends',
			'Microservices',
			'EF Core',
			'Oracle',
			'Azure DevOps',
		],
	},
	{
		id: 'giz',
		name: 'Gesellschaft für internationale Zusammenarbeit (GIZ)',
		stack: [
			'C#',
			'.NET',
			'Angular',
			'TypeScript',
			'Node.js',
			'EF Core',
			'MS SQL',
			'Azure DevOps',
		],
	},
	{
		id: 'wts',
		name: 'WTS Steuerberatungsgesellschaft mbH',
		stack: [
			'C#',
			'.NET',
			'Angular',
			'TypeScript',
			'Entity Framework',
			'IdentityServer',
			'MS SQL',
		],
	},
	{
		id: 'dzr',
		name: 'Deutsches Zahnärztliches Rechenzentrum GmbH',
		stack: ['C#', 'WPF', 'DevExpress'],
	},
];
