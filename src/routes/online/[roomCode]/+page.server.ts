import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, session, user }, params }) => {
	if (!supabase) {
		error(500, {
			message: 'Supabase client is not available',
		});
	}

	if (!session || !user) redirect(303, '/online');

	const { data: gameData, error: gameError } = await supabase
		.from('online_games')
		.select(
			`
		*,
		players:online_players (*)
	`,
		)
		.eq('room_code', params.roomCode)
		.single();

	if (gameError || !gameData) {
		await supabase.auth.signOut();
		redirect(303, '/online');
	}

	if (!gameData.players?.some(p => p.user_id === user.id)) {
		const { data: playerData, error: playerError } = await supabase
			.from('online_players')
			.select(
				`
			*,
			online_games (
				room_code
			)
		`,
			)
			.eq('user_id', user.id)
			.limit(1)
			.single();

		if (playerError || !playerData) {
			await supabase.auth.signOut();
			redirect(303, '/online');
		}

		redirect(303, `/online/${playerData.online_games.room_code}`);
	}
	console.log('🚀 ~ load ~ gameData:', gameData);

	return {};
};
