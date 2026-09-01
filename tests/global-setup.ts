import { execFileSync } from 'node:child_process';

const PORT = 4321;
const URL = `http://localhost:${PORT}`;

function run(...args: string[]) {
	execFileSync('pnpm', args, { stdio: 'inherit' });
}

async function waitForServer(timeoutMs = 30_000) {
	const deadline = Date.now() + timeoutMs;

	while (Date.now() < deadline) {
		try {
			const response = await fetch(URL, { redirect: 'manual' });
			if (response.status < 500) return;
		} catch {
			/* not up yet */
		}
		await new Promise((resolve) => setTimeout(resolve, 250));
	}

	throw new Error(`Preview server did not become ready at ${URL}`);
}

export default async function globalSetup() {
	run('build');
	run('astro', 'preview', '--background', '--port', String(PORT));
	await waitForServer();
}
