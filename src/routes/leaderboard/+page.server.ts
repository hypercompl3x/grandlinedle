import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import crypto from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { kv } from '$lib/kv';
import { getMidnightGMT, getArrayLengthFromCookie } from '$lib/utils/helpers';
import type { Database, Leaderboard, LeaderboardEntry } from '$lib/types/DatabaseTypes';
import type { Actions } from '../$types';
import { COOKIE, NUMBER_OF_GAME_MODES } from '$lib/utils/constants';

import { IP_HASH_SECRET } from '$env/static/private';

const getLeaderboard = async (supabase: SupabaseClient<Database>): Promise<Leaderboard> => {
	const { data, error: err } = await supabase.from('leaderboard').select('*');

	if (err || !data) {
		error(500, {
			message: 'Failed to get leaderboard',
		});
	}

	return data
		.toSorted((a, b) => {
			const averageA = (a.classic + a.location + a.quote + a.crew) / NUMBER_OF_GAME_MODES;
			const averageB = (b.classic + b.location + b.quote + b.crew) / NUMBER_OF_GAME_MODES;

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

const THIRTY_DAYS = 60 * 60 * 24 * 30;
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

const hashIp = (ip: string) => crypto.createHmac('sha256', IP_HASH_SECRET).update(ip).digest('hex');

export const actions = {
	'submit-entry': async ({ cookies, request, locals, getClientAddress }) => {
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

		if (characterGuessesLen < 2) {
			const ip = getClientAddress() || '127.0.0.1';
			const hashedIp = hashIp(ip);

			const key = `ip:${hashedIp}:classic1:30d`;
			const newCount = await kv.incr(key);
			await kv.expire(key, THIRTY_DAYS);

			if (newCount > 1) {
				return {
					errorMessage:
						'This submission was flagged for suspicious activity and cannot be added to the leaderboard.',
				};
			}
		}

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
			cookies.set(COOKIE.PLAYER_NAME, playerName, { path: '/', maxAge: TEN_YEARS });
		}
	},
} satisfies Actions;
