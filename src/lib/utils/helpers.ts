import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Character } from '$lib/types/DatabaseTypes';

export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};

export const formatBounty = (bounty: Character['last_bounty']) => {
	if (bounty >= 1_000_000_000) {
		return `${(bounty / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
	} else if (bounty >= 1_000_000) {
		return `${(bounty / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
	} else {
		return bounty;
	}
};

export const formatHeight = (heightM: Character['height_m'], heightCm: Character['height_cm']) => {
	if (heightM > 0 && heightCm > 0) {
		return `${heightM}m${heightCm < 10 ? `0${heightCm}` : heightCm}`;
	} else if (heightM > 0) {
		return `${heightM}m`;
	} else if (heightCm > 0) {
		return `${heightCm}cm`;
	} else {
		return '';
	}
};

export const getMidnightGMT = () => {
	const now = new Date();
	const offset = now.getTimezoneOffset();
	const hour = offset === 60 ? 1 : 0;
	return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, hour));
};
