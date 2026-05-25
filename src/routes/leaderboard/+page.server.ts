import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getMidnightGMT, getArrayLengthFromCookie } from '$lib/utils/helpers';
import type { Database, Leaderboard, LeaderboardEntry } from '$lib/types/DatabaseTypes';
import type { Actions } from '../$types';
import { COOKIE, NUMBER_OF_GAME_MODES } from '$lib/utils/constants';

const getLeaderboard = async (supabase: SupabaseClient<Database>): Promise<Leaderboard> => {
	const { data, error: err } = await supabase.from('leaderboard').select('*');

	if (err || !data) {
		error(500, {
			message: 'Failed to get leaderboard',
		});
	}

	return data
		.toSorted((a, b) => {
			const averageA = (a.classic + a.location + a.quote) / NUMBER_OF_GAME_MODES;
			const averageB = (b.classic + b.location + b.quote) / NUMBER_OF_GAME_MODES;

			return averageA - averageB;
		})
		.slice(0, 10);
};

const addLeaderboardEntry = async (
	supabase: SupabaseClient<Database>,
	entry: Omit<LeaderboardEntry, 'id'>,
) => {
	const { error } = await supabase.from('leaderboard').insert([entry]);

	if (error) {
		console.error(error.message);
		return {
			errorMessage:
				error.code === '23505'
					? 'A player with that name has already submitted today'
					: 'An unexpected error has occured',
		};
	}
};

const getPageData = async (supabase: SupabaseClient<Database>) => ({
	leaderboard: await getLeaderboard(supabase),
});

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	if (!supabase) {
		error(500, {
			message: 'Supabase client is not available',
		});
	}

	return {
		pageData: getPageData(supabase),
	};
};

export const actions = {
	'submit-entry': async ({ cookies, request, locals }) => {
		const submittedEntryCookie = cookies.get(COOKIE.SUBMITTED_ENTRY);

		if (submittedEntryCookie) {
			return { errorMessage: 'You have already submitted today' };
		}

		const data = await request.formData();
		const playerName = (data.get('playername') as string) || '';

		if (playerName.length < 3) {
			return { errorMessage: 'Please use a name over 2 characters' };
		}

		if (playerName.length > 15) {
			return { errorMessage: 'Please use a name under 15 characters' };
		}

		const characterGuessesLen = getArrayLengthFromCookie(cookies, COOKIE.CHARACTERS);
		const locationGuessesLen = getArrayLengthFromCookie(cookies, COOKIE.LOCATIONS);
		const quoteCharacterGuessesLen = getArrayLengthFromCookie(cookies, COOKIE.QUOTE_CHARACTERS);
		const crewGuessesLen = getArrayLengthFromCookie(cookies, COOKIE.CREWS);

		const entry: Omit<LeaderboardEntry, 'id'> = {
			player: playerName,
			classic: characterGuessesLen,
			location: locationGuessesLen,
			quote: quoteCharacterGuessesLen,
			crew: crewGuessesLen,
		};

		const response = await addLeaderboardEntry(locals.supabase, entry);

		if (response?.errorMessage) {
			return { errorMessage: response.errorMessage };
		}

		cookies.set(COOKIE.SUBMITTED_ENTRY, 'true', { path: '/', expires: getMidnightGMT() });

		const playerNameCookie = cookies.get(COOKIE.PLAYER_NAME);

		if (playerNameCookie !== playerName) {
			cookies.set(COOKIE.PLAYER_NAME, playerName, { path: '/', maxAge: 60 * 60 * 24 * 365 * 10 });
		}
	},
} satisfies Actions;
