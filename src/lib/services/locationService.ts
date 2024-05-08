import { supabase } from '$lib/supabaseClient';
import type { Location } from '$lib/types/DatabaseTypes';

export const getLocationsFromQuery = async (query: string, currentGuesses: Location['id'][]) => {
	const { data: locations, error } = await supabase
		.from('locations')
		.select()
		.or(`name.ilike.% ${query}%,name.ilike.${query}%`)
		.not('id', 'in', `(${currentGuesses.join(',')})`);

	if (error) {
		console.error(error.message);
		return [];
	}

	return locations;
};
