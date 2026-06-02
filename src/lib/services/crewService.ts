import { supabase } from '$lib/supabaseClient';
import type { Crew } from '$lib/types/DatabaseTypes';

export const getCrewsFromQuery = async (query: string, currentGuesses: Crew['id'][]) => {
	const { data: crews, error } = await supabase
		.from('crews')
		.select()
		.or(`name.ilike.%${query}%`)
		.not('id', 'in', `(${currentGuesses.join(',')})`);

	if (error) {
		console.error(error.message);
		return [];
	}

	return crews;
};
