import { execFileSync } from 'node:child_process';

export default function globalTeardown() {
	execFileSync('pnpm', ['astro', 'preview', 'stop'], { stdio: 'inherit' });
}
