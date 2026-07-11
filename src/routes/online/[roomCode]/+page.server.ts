import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getGameFromRoomCode, getRoomCodeFromUser } from '$lib/services/onlineService';
import { getImages, getRoundImages } from '$lib/services/serviceHelpers';

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

	const { players, rounds, guesses, ...game } = gameData;

	const currentPlayer = players.find(p => p.user_id === user.id);

	if (!currentPlayer) {
		await supabase.auth.signOut();
		redirect(303, '/online');
	}

	const playersWithImages = await getImages(players, supabase, 'icons');
	const roundsWithImages = await getRoundImages(rounds, supabase);

	return {
		game,
		players: playersWithImages,
		rounds: roundsWithImages,
		guesses,
		userId: user.id,
		currentPlayer,
	};
};

export const actions = {
	default: async ({ request, locals: { supabase, session, user }, params }) => {
		if (!supabase) {
			error(500, {
				message: 'Supabase client is not available',
			});
		}

		if (!session || !user) {
			redirect(303, '/online');
		}

		const data = await request.formData();
		const characterId = Number(data.get('characterId'));
		const roundId = Number(data.get('roundId'));
		const guessNumber = Number(data.get('guessNumber'));

		const { error: submitGuessError } = await supabase.rpc('submit_online_guess', {
			p_room_code: params.roomCode,
			p_character_id: characterId,
			p_round_id: roundId,
			p_guess_number: guessNumber,
		});

		if (submitGuessError) {
			console.error(submitGuessError.message);
			return { success: false };
		}

		return { success: true };
	},
} satisfies Actions;
