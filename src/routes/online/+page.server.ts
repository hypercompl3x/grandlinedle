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

		const { data: authData, error: authError } = await supabase.auth.signInAnonymously({
			options: { data: { displayName } },
		});

		if (authError || !authData.user) {
			return fail(500, {
				errors: { generic: [GENERIC_ERROR] },
			});
		}

		const { data: gameData, error: gameError } = await getGameFromRoomCode(supabase, roomCode);

		if (gameError || !gameData) {
			await supabase.auth.signOut();
			return fail(400, {
				errors: { roomCode: ['A game with this room code does not exist'] },
			});
		}

		const nameIsUnique = gameData.players.every(
			p => p.display_name.toLowerCase() !== displayName.toLowerCase(),
		);

		if (!nameIsUnique) {
			await supabase.auth.signOut();
			return fail(400, {
				errors: { displayName: ['This display name is already taken'] },
			});
		}

		if (gameData.players.length === MAX_ONLINE_PLAYER_COUNT) {
			await supabase.auth.signOut();
			return fail(400, {
				errors: { roomCode: ['This game is already full'] },
			});
		}

		if (gameData.status !== 'lobby') {
			await supabase.auth.signOut();
			return fail(400, {
				errors: { roomCode: ['This game has already started'] },
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

		const randomIcon = getRandomIcon(displayName);

		const { data: gameData, error: gameError } = await supabase.rpc(
			'create_online_game_with_host',
			{
				p_display_name: displayName,
				p_icon: randomIcon,
			},
		);

		if (gameError || !gameData?.[0]) {
			await supabase.auth.signOut();
			return fail(500, {
				errors: { generic: [gameError?.message ?? GENERIC_ERROR] },
			});
		}

		redirect(303, `/online/${gameData[0].room_code}`);
	},
} satisfies Actions;
