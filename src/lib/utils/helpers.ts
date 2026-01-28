import { tick } from 'svelte';
import gsap, { Power2 } from 'gsap';
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

export const animateNewItem = async (
	playerHasWon: boolean,
	variant: 'character' | 'location' | 'quote',
) => {
	await tick();

	const tl = gsap.timeline({
		onComplete: () => {
			if (playerHasWon) {
				const successBoxEl = document.getElementById(`success-box`);
				successBoxEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		},
		defaults: { opacity: 0, ease: Power2.easeInOut, duration: 0.6 },
	});

	if (variant === 'character') {
		tl.from('#gender-0', {})
			.from('#affiliation-0', {})
			.from('#devil_fruit-0', {})
			.from('#haki-0', {})
			.from('#last_bounty-0', {})
			.from('#height-0', {})
			.from('#origin-0', {})
			.from('#first_saga-0', {});
	} else if (variant === 'location') {
		tl.from('#location-0', {});
	} else {
		tl.from('#quotecharacter-0', {});
	}
};

export const getLocalImages = async <T extends { url: string }>(items: T[]): Promise<T[]> => {
	return await Promise.all(
		items.map(async item => {
			const res = await fetch(item.url, { method: 'GET' });

			if (!res.ok) return { ...item, url: '' };

			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			return {
				...item,
				url,
			};
		}),
	);
};

export const objectAsValues = <T extends object>(obj: T) => Object.values(obj) as T[keyof T][];
