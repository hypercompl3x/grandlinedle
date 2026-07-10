import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getGameFromRoomCode, getRoomCodeFromUser } from '$lib/services/onlineService';

export const load: PageServerLoad = async ({ locals: { supabase, session, user }, params }) => {
	if (!supabase) {
		error(500, {
			message: 'Supabase client is not available',
		});
	}

	if (!session || !user) redirect(303, '/online');

	const { data: gameData, error: gameError } = await getGameFromRoomCode(supabase, params.roomCode);

	if (gameError || !gameData) {
		const roomCode = await getRoomCodeFromUser(supabase, user.id);
		redirect(303, roomCode ? `/online/${roomCode}` : '/online');
	}

	const userInGame = gameData.players.some(p => p.user_id === user.id);

	if (!userInGame) {
		const roomCode = await getRoomCodeFromUser(supabase, user.id);
		redirect(303, roomCode ? `/online/${roomCode}` : '/online');
	}

	return { game: gameData };
};
