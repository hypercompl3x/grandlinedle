import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import * as v from 'valibot';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/DatabaseTypes';
import { GENERIC_ERROR } from '$lib/utils/constants';

const joinSchema = v.object({
	displayName: v.pipe(
		v.string(),
		v.nonEmpty('Please enter a display name'),
		v.maxLength(14, 'Display name must be under 15 characters'),
	),
	roomCode: v.pipe(
		v.string(),
		v.nonEmpty('Please enter a room code'),
		v.length(4, 'Room code must be 4 characters'),
	),
});

const hostSchema = v.object({
	displayName: v.pipe(
		v.string(),
		v.nonEmpty('Please enter a display name'),
		v.maxLength(14, 'Display name must be under 15 characters'),
	),
	numberOfRounds: v.pipe(
		v.string(),
		v.transform(Number),
		v.integer(),
		v.minValue(1, 'The minimum number is 1'),
		v.maxValue(8, 'The maximum number is 8'),
	),
});

const generateRoomCode = () => {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	let code = '';

	for (let i = 0; i < 4; i++) {
		code += chars[Math.floor(Math.random() * chars.length)];
	}

	return code;
};

const createOnlineGame = async (supabase: SupabaseClient<Database>, numberOfRounds: number) => {
	const maxAttempts = 5;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		const roomCode = generateRoomCode();

		const { data, error } = await supabase
			.from('online_games')
			.insert({ room_code: roomCode, number_of_rounds: numberOfRounds })
			.select('*')
			.single();

		if (!error) return data;

		if (error.code !== '23505') {
			console.error(error.message);
			throw new Error('Failed to create online game');
		}
	}

	throw new Error('Could not generate a unique room code');
};

const createOnlinePlayer = async (
	supabase: SupabaseClient<Database>,
	userId: string,
	displayName: string,
	gameId: number,
) => {
	const { error } = await supabase
		.from('online_players')
		.insert({ user_id: userId, display_name: displayName, game_id: gameId, is_host: true })
		.single();

	if (!error) return;
	console.error(error.message);
	throw new Error('Failed to create online game');
};

export const actions = {
	join: async ({ request, locals: { supabase } }) => {
		const data = await request.formData();
		const result = v.safeParse(joinSchema, {
			displayName: data.get('displayName'),
			roomCode: data.get('roomCode'),
		});

		await new Promise(res => setTimeout(res, 1000));

		if (!result.success) {
			return fail(400, {
				errors: v.flatten<typeof joinSchema>(result.issues).nested,
			});
		}

		// NAME NEEDS TO BE UNIQUE PER GAME
		// GAME NEEDS TO NOT HAVE MAXIMUM NUMBER OF PLAYERS...

		const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

		if (authError) {
			return fail(500, {
				errors: { generic: [GENERIC_ERROR] },
			});
		}
	},
	host: async ({ request, locals: { supabase } }) => {
		const data = await request.formData();
		const result = v.safeParse(hostSchema, {
			displayName: data.get('displayName'),
			numberOfRounds: data.get('numberOfRounds'),
		});

		if (!result.success) {
			return fail(400, {
				errors: v.flatten<typeof hostSchema>(result.issues).nested,
			});
		}

		const { displayName, numberOfRounds } = result.output;

		const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

		if (authError) {
			return fail(500, {
				errors: { generic: [GENERIC_ERROR] },
			});
		}

		// LOGIN TO ANONYMOUS
		// USE THAT USER TO CREATE A PLAYER
		// FIGURE OUT HOW THAT IS TIED TO PRESENCE

		const game = await createOnlineGame(supabase, numberOfRounds);
		await createOnlinePlayer(supabase, authData.user!.id, displayName, game.id);

		redirect(303, `/online/${game.room_code}`);
	},
} satisfies Actions;
