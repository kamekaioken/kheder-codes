export function cycle(index: number, delta: number, length: number): number {
	if (length < 1) return 0;
	return (index + delta + length) % length;
}

export function digitIndex(key: string, length: number): number | null {
	if (!/^[1-9]$/.test(key)) return null;
	const index = Number(key) - 1;
	return index < length ? index : null;
}
