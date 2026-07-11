import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import * as v from 'valibot';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getGameFromRoomCode, getRoomCodeFromUser } from '$lib/services/onlineService';
import { GENERIC_ERROR, ICON, MAX_ONLINE_PLAYER_COUNT } from '$lib/utils/constants';
import type { Database } from '$lib/types/DatabaseTypes';

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
});

const generateRoomCode = () => {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
	let code = '';

	for (let i = 0; i < 4; i++) {
		code += chars[Math.floor(Math.random() * chars.length)];
	}

	return code;
};

const createOnlineGame = async (supabase: SupabaseClient<Database>) => {
	const maxAttempts = 5;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		const roomCode = generateRoomCode();

		const { data, error } = await supabase
			.from('online_games')
			.insert({ room_code: roomCode })
			.select('*')
			.single();

		if (!error) return { data };

		if (error.code !== '23505') {
			console.error(error.message);
			return { error: 'Failed to create online game' };
		}
	}

	return { error: 'Could not generate a unique room code' };
};

const getRandomIcon = (displayName: string, existingIcons: number[] = []) => {
	if (displayName.toLowerCase().includes('hyde') && !existingIcons.includes(ICON.FOXY))
		return ICON.FOXY;

	const allowedNumbers = Array.from(
		{ length: ICON.MAX - ICON.MIN + 1 },
		(_, i) => ICON.MIN + i,
	).filter(number => !existingIcons.includes(number));

	const randomIndex = Math.floor(Math.random() * allowedNumbers.length);

	return allowedNumbers[randomIndex];
};

const createOnlinePlayer = async (
	supabase: SupabaseClient<Database>,
	userId: string,
	displayName: string,
	gameId: number,
	icon: number,
	isHost = false,
) => {
	const { error } = await supabase
		.from('online_players')
		.insert({ user_id: userId, display_name: displayName, game_id: gameId, is_host: isHost, icon })
		.single();

	if (!error) return;
	console.error(error.message);
	return { error: 'Failed to create online player' };
};

export const load: PageServerLoad = async ({ cookies, locals: { session, user, supabase } }) => {
	if (session && user) {
		const roomCode = await getRoomCodeFromUser(supabase, user.id);

		if (roomCode) {
			redirect(303, `/online/${roomCode}`);
		}
	}
};

export const actions = {
	join: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const result = v.safeParse(joinSchema, {
			displayName: formData.get('displayName'),
			roomCode: formData.get('roomCode'),
		});

		if (!result.success) {
			return fail(400, {
				errors: v.flatten<typeof joinSchema>(result.issues).nested,
			});
		}

		const { displayName, roomCode } = result.output;

		const { data: gameData, error: gameError } = await getGameFromRoomCode(supabase, roomCode);

		if (gameError || !gameData) {
			return fail(400, {
				errors: { roomCode: ['A game with this room code does not exist'] },
			});
		}

		const nameIsUnique = gameData.players.every(
			p => p.display_name.toLowerCase() !== displayName.toLowerCase(),
		);

		if (!nameIsUnique) {
			return fail(400, {
				errors: { displayName: ['This display name is already taken'] },
			});
		}

		if (gameData.players.length === MAX_ONLINE_PLAYER_COUNT) {
			return fail(400, {
				errors: { roomCode: ['This game is already full'] },
			});
		}

		if (gameData.status !== 'lobby') {
			return fail(400, {
				errors: { roomCode: ['This game has already started'] },
			});
		}

		const { data: authData, error: authError } = await supabase.auth.signInAnonymously({
			options: { data: { displayName } },
		});

		if (authError || !authData.user) {
			return fail(500, {
				errors: { generic: [GENERIC_ERROR] },
			});
		}

		const existingIcons = gameData.players.map(p => p.icon);
		const randomIcon = getRandomIcon(displayName, existingIcons);
		const playerData = await createOnlinePlayer(
			supabase,
			authData.user.id,
			displayName,
			gameData.id,
			randomIcon,
		);

		if (playerData?.error) {
			await supabase.auth.signOut();
			return fail(500, {
				errors: { generic: [playerData.error] },
			});
		}

		redirect(303, `/online/${gameData.room_code}`);
	},
	host: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const result = v.safeParse(hostSchema, {
			displayName: formData.get('displayName'),
		});

		if (!result.success) {
			return fail(400, {
				errors: v.flatten<typeof hostSchema>(result.issues).nested,
			});
		}

		const { displayName } = result.output;

		const { data: authData, error: authError } = await supabase.auth.signInAnonymously({
			options: { data: { displayName } },
		});

		if (authError || !authData.user) {
			return fail(500, {
				errors: { generic: [GENERIC_ERROR] },
			});
		}

		const { data: gameData, error: gameError } = await createOnlineGame(supabase);

		if (gameError || !gameData) {
			await supabase.auth.signOut();
			return fail(500, {
				errors: { generic: [gameError] },
			});
		}

		const randomIcon = getRandomIcon(displayName);
		const playerData = await createOnlinePlayer(
			supabase,
			authData.user.id,
			displayName,
			gameData.id,
			randomIcon,
			true,
		);

		if (playerData?.error) {
			await supabase.from('online_games').delete().eq('id', gameData.id);
			await supabase.auth.signOut();
			return fail(500, {
				errors: { generic: [playerData.error] },
			});
		}

		redirect(303, `/online/${gameData.room_code}`);
	},
} satisfies Actions;
