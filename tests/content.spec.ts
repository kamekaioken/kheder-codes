import { expect, test } from '@playwright/test';
import { openTerminalFromHero, routes } from './helpers';

test.describe('content pages', () => {
	test('the home page introduces the three of us and the chip groups', async ({
		page,
	}) => {
		await page.goto(routes.de.home);
		await openTerminalFromHero(page);

		await expect(page.locator('main')).toContainText('$ whoami');
		await expect(page.locator('h1')).toHaveText(
			'Servus, wir sind KHEDER.codes.',
		);
		await expect(page.locator('main p').first()).toContainText(
			'Drei Softwareentwickler aus Nürnberg: Kheder, Alan und Andrej.',
		);
		await expect(page.locator('main strong')).toHaveText(
			'Kheder, Alan und Andrej',
		);

		const donna = page.locator('main a', { hasText: 'DonnaDesk' });
		await expect(donna).toHaveAttribute('href', 'https://www.donnadesk.de');
		await expect(donna).toHaveAttribute('target', '_blank');

		for (const group of [
			'# Sprachen & Frameworks',
			'# Runtime & Tooling',
			'# AI & Realtime',
		]) {
			await expect(page.locator('main')).toContainText(group);
		}
		for (const chip of [
			'TypeScript',
			'C#',
			'.NET',
			'Bun',
			'Astro',
			'LiveKit',
			'Voice Agents',
		]) {
			await expect(
				page
					.locator('main span', {
						hasText: new RegExp(
							`^${chip.replace('.', '\\.').replace('#', '#')}$`,
						),
					})
					.first(),
			).toBeVisible();
		}
	});

	test('team lists the three profiles as markdown files', async ({ page }) => {
		await page.goto(routes.de.team);

		await expect(page.locator('main')).toContainText('$ ls ./team');
		await expect(page.locator('h1')).toHaveText('Team');
		await expect(page.locator('main li')).toHaveCount(3);

		const entries = page.locator('main li');
		await expect(entries.nth(0)).toContainText('marlen-kheder.md');
		await expect(entries.nth(0)).toContainText('Marlen Kheder');
		await expect(entries.nth(1)).toContainText('Alan Kerkuki');
		await expect(entries.nth(2)).toContainText('Andrej Ilnizkij');

		await expect(entries.nth(1).locator('a')).toHaveAttribute(
			'href',
			'/team/alan-kerkuki',
		);
	});

	test('a profile renders its markdown body under its own heading', async ({
		page,
	}) => {
		await page.goto(routes.de.member);

		await expect(page.locator('main')).toContainText(
			'$ cat ./team/marlen-kheder.md',
		);
		await expect(page.locator('h1')).toHaveText('Marlen Kheder');
		await expect(page.getByTestId('member-role')).toHaveText(
			'Full-Stack & Voice AI',
		);
		await expect(page.locator('main h2').first()).toHaveText(
			'Woran ich arbeite',
		);
		await expect(page.locator('main')).toContainText(
			'Bei DonnaDesk verantworte ich die Plattform für Voice-AI-Agenten',
		);
	});

	test('blog lists the three stubs and the note', async ({ page }) => {
		await page.goto(routes.de.blog);

		await expect(page.locator('main')).toContainText('$ ls ./blog');
		await expect(page.locator('h1')).toHaveText('Blog');
		await expect(page.locator('main li')).toHaveCount(3);
		await expect(page.locator('main')).toContainText(
			'voice-agents-mit-livekit.md',
		);
		await expect(page.locator('main')).toContainText(
			'Noch nichts veröffentlicht — die ersten Artikel sind in Arbeit.',
		);
	});

	test('an article stub shows the cat kicker and the back hint', async ({
		page,
	}) => {
		await page.goto(routes.de.post);

		await expect(page.locator('main')).toContainText(
			'$ cat ./blog/voice-agents-mit-livekit.md',
		);
		await expect(page.locator('h1')).toHaveText('Voice Agents mit LiveKit');
		await expect(page.locator('main')).toContainText(
			'Dieser Artikel ist noch in Arbeit — schau bald wieder vorbei.',
		);
		await expect(page.locator('main')).toContainText(
			'⎋ ESC — zurück zur Übersicht',
		);
	});

	test('referenzen names the client, the project and the stack', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);

		await expect(page.locator('main')).toContainText('$ cat referenzen.md');
		await expect(page.locator('h1')).toHaveText('Referenzen');

		const entries = page.locator('main > section > ul > li');
		await expect(entries).toHaveCount(5);
		await expect(entries.nth(0)).toContainText('DonnaDesk GmbH');
		await expect(entries.nth(0)).toContainText(
			'Plattform für Voice-AI-Agenten, gebaut für Berufsgeheimnisträger.',
		);
		await expect(entries.nth(1)).toContainText('Hannover Rück SE');
		await expect(entries.nth(2)).toContainText(
			'Gesellschaft für internationale Zusammenarbeit (GIZ)',
		);
		await expect(entries.nth(3)).toContainText(
			'WTS Steuerberatungsgesellschaft mbH',
		);
		await expect(entries.nth(4)).toContainText(
			'Deutsches Zahnärztliches Rechenzentrum GmbH',
		);
		await expect(entries.nth(4)).not.toHaveClass(/border-b/);

		await expect(entries.nth(0).locator('ul li')).toContainText([
			'TypeScript',
			'Bun',
			'Elysia',
			'LiveKit',
			'SvelteKit',
			'Astro',
			'Supabase',
			'Pulumi',
		]);
		await expect(entries.nth(4).locator('ul li')).toContainText([
			'C#',
			'WPF',
			'DevExpress',
		]);
	});

	// Copied out of an old CV, the stacks used to carry tooling and versions that
	// say nothing about the work.
	test('the stacks name no versions and no dead tooling', async ({ page }) => {
		await page.goto(routes.de.refs);
		const body = (await page.locator('main').textContent()) ?? '';

		for (const dropped of [
			'ASP.NET',
			'.NET Core',
			'Visual Studio',
			'TFVC',
			'TFS',
			'AppLink',
			'Aspose',
			'Bootstrap',
		]) {
			expect(body, dropped).not.toContain(dropped);
		}
		expect(body).not.toMatch(/\b\d+\.\d+\b/);
	});

	test('kontakt lists mail, github and linkedin', async ({ page }) => {
		await page.goto(routes.de.contact);

		await expect(page.locator('main')).toContainText('$ kheder --kontakt');
		await expect(page.locator('h1')).toHaveText('Sag hallo.');

		await expect(
			page.locator('main a', { hasText: 'hallo@kheder.codes' }),
		).toHaveAttribute('href', 'mailto:hallo@kheder.codes');
		await expect(
			page.locator('main a', { hasText: 'github.com/kamekaioken' }),
		).toHaveAttribute('href', 'https://github.com/kamekaioken');
		await expect(
			page.locator('main a', { hasText: 'linkedin.com/in/marlenkheder' }),
		).toHaveAttribute('href', 'https://www.linkedin.com/in/marlenkheder');
	});

	test('every content page ends with the footer', async ({ page }) => {
		for (const path of [
			routes.de.team,
			routes.de.blog,
			routes.de.refs,
			routes.de.contact,
		]) {
			await page.goto(path);
			const footer = page.locator('footer');
			await expect(footer).toBeVisible();
			await expect(footer.locator('img')).toBeVisible();
			await expect(footer).toContainText('exit 0');
		}
	});
});

test.describe('markdown pages point at their neighbours', () => {
	const chains = [
		{
			name: 'team',
			pages: [
				'/team/marlen-kheder',
				'/team/alan-kerkuki',
				'/team/andrej-ilnizkij',
			],
			files: ['marlen-kheder.md', 'alan-kerkuki.md', 'andrej-ilnizkij.md'],
		},
		{
			name: 'blog',
			pages: [
				'/blog/voice-agents-mit-livekit',
				'/blog/monorepos-ohne-kopfschmerzen',
				'/blog/astro-fuer-freelancer',
			],
			files: [
				'voice-agents-mit-livekit.md',
				'monorepos-ohne-kopfschmerzen.md',
				'astro-fuer-freelancer.md',
			],
		},
		{
			name: 'legal',
			pages: ['/impressum', '/datenschutz'],
			files: ['impressum.md', 'datenschutz.md'],
		},
	];

	for (const { name, pages, files } of chains) {
		test(`${name}: each page links the one before and the one after`, async ({
			page,
		}) => {
			for (const [index, path] of pages.entries()) {
				await page.goto(path);

				const prev = page.getByTestId('doc-prev');
				const next = page.getByTestId('doc-next');

				if (index === 0) {
					await expect(prev, path).toHaveCount(0);
				} else {
					await expect(prev, path).toContainText(files[index - 1] as string);
					await expect(prev, path).toHaveAttribute(
						'href',
						pages[index - 1] as string,
					);
				}

				if (index === pages.length - 1) {
					await expect(next, path).toHaveCount(0);
				} else {
					await expect(next, path).toContainText(files[index + 1] as string);
					await expect(next, path).toHaveAttribute(
						'href',
						pages[index + 1] as string,
					);
				}
			}
		});
	}

	test('the links walk the whole chain forwards and back', async ({ page }) => {
		await page.goto('/team/marlen-kheder');

		await page.getByTestId('doc-next').click();
		await expect(page.locator('h1')).toHaveText('Alan Kerkuki');

		await page.getByTestId('doc-next').click();
		await expect(page.locator('h1')).toHaveText('Andrej Ilnizkij');

		await page.getByTestId('doc-prev').click();
		await expect(page.locator('h1')).toHaveText('Alan Kerkuki');

		await page.getByTestId('doc-prev').click();
		await expect(page.locator('h1')).toHaveText('Marlen Kheder');
	});
});

test.describe('design tokens', () => {
	test('light theme paints the handoff colours', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'light' });
		await page.goto(routes.de.refs);

		await expect(page.locator('body')).toHaveCSS(
			'background-color',
			'rgb(245, 245, 247)',
		);
		await expect(page.locator('body')).toHaveCSS('color', 'rgb(29, 29, 31)');
		await expect(page.getByTestId('term-title')).toHaveCSS(
			'color',
			'rgb(110, 110, 115)',
		);
		await expect(
			page.locator('[data-testid="menu-home"] span').first(),
		).toHaveCSS('color', 'rgb(14, 126, 138)');
	});

	test('dark theme paints the handoff colours', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'dark' });
		await page.goto(routes.de.refs);

		await expect(page.locator('body')).toHaveCSS(
			'background-color',
			'rgb(22, 22, 24)',
		);
		await expect(page.locator('body')).toHaveCSS('color', 'rgb(232, 232, 234)');
		await expect(page.getByTestId('term-title')).toHaveCSS(
			'color',
			'rgb(152, 152, 157)',
		);
		await expect(
			page.locator('[data-testid="menu-home"] span').first(),
		).toHaveCSS('color', 'rgb(90, 200, 250)');
	});

	test('the terminal keeps its 840px window and its chrome on a narrow screen', async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1000, height: 900 });
		await page.goto(routes.de.refs);

		const box = await page.getByTestId('terminal').boundingBox();
		expect(box?.width).toBe(840);

		const titlebar = page.locator('[data-testid="terminal"] .h-10').first();
		await expect(titlebar).toHaveCSS('height', '40px');
	});
});
