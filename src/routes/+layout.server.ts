import type { Cookies } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { GAME_MODE } from '$lib/utils/constants';
import { objectAsValues } from '$lib/utils/helpers';

const GAME_MODES = objectAsValues(GAME_MODE);

const getArrayLengthFromCookie = (cookies: Cookies, name: string): number => {
	try {
		return JSON.parse(cookies.get(name) ?? '[]').length;
	} catch {
		return 0;
	}
};

export const load: LayoutServerLoad = async ({ cookies }) => {
	const completedString = cookies.get('completed') || '[]';
	const completed = JSON.parse(completedString);

	if (GAME_MODES.some(m => !completed.includes(m))) return { completed: false };

	const characterGuessesLen = getArrayLengthFromCookie(cookies, 'characters');
	const locationGuessesLen = getArrayLengthFromCookie(cookies, 'locations');
	const quoteCharacterGuessesLen = getArrayLengthFromCookie(cookies, 'quotecharacters');

	const today = new Date(
		new Intl.DateTimeFormat('en-CA', {
			timeZone: 'Europe/London',
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		}).format(new Date()) + 'T00:00:00Z',
	);
	const startDate = new Date('2024-05-05T00:00:00Z');
	const msPerDay = 24 * 60 * 60 * 1000;
	const todayNumber = Math.floor((today.getTime() - startDate.getTime()) / msPerDay) + 1;

	return {
		characterGuessesLen,
		locationGuessesLen,
		quoteCharacterGuessesLen,
		todayNumber,
		completed: true,
	};
};
