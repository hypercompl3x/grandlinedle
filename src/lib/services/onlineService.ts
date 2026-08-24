import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database, OnlineGame } from '$lib/types/DatabaseTypes';

export const getRoomCodeFromUser = async (
	supabase: SupabaseClient<Database>,
	userId: User['id'],
) => {
	const { data, error } = await supabase
		.from('online_players')
		.select(
			`
			*,
			online_games (
				room_code
			)
		`,
		)
		.eq('user_id', userId)
		.limit(1)
		.maybeSingle();

	if (error || !data) {
		console.error(error?.message);
		await supabase.auth.signOut();
		return;
	}

	return data.online_games.room_code;
};

export const getGameFromRoomCode = async (
	supabase: SupabaseClient<Database>,
	roomCode: OnlineGame['room_code'],
) => {
	return await supabase
		.from('online_games')
		.select(
			`
		*,
		players:online_players (*),
		rounds:online_rounds (
			*,
			character:characters (*)
		),
		guesses:online_guesses (
			*,
			character:characters (name)
		)
	`,
		)
		.order('id', {
			ascending: true,
			referencedTable: 'online_players',
		})
		.order('round_number', {
			ascending: true,
			referencedTable: 'online_rounds',
		})
		.eq('room_code', roomCode)
		.limit(1)
		.single();
};
