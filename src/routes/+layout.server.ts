import type { LayoutServerLoad } from './$types';
import { GAME_MODE } from '$lib/utils/constants';
import { objectAsValues } from '$lib/utils/helpers';
import { getArrayLengthFromCookie } from '$lib/utils/helpers';
import { COOKIE } from '$lib/utils/constants';

const GAME_MODES = objectAsValues(GAME_MODE);

export const load: LayoutServerLoad = async ({ cookies }) => {
	const completedString = cookies.get(COOKIE.COMPLETED) || '[]';
	const completed = JSON.parse(completedString);

	if (GAME_MODES.some(m => !completed.includes(m))) return { completed: false };

	const playerName = cookies.get(COOKIE.PLAYER_NAME) || '';
	const submittedEntry = !!cookies.get(COOKIE.SUBMITTED_ENTRY);

	const characterGuessesLen = getArrayLengthFromCookie(cookies, COOKIE.CHARACTERS);
	const locationGuessesLen = getArrayLengthFromCookie(cookies, COOKIE.LOCATIONS);
	const quoteCharacterGuessesLen = getArrayLengthFromCookie(cookies, COOKIE.QUOTE_CHARACTERS);

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
		submittedEntry,
		playerName,
	};
};
