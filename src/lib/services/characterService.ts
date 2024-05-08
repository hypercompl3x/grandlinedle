import { supabase } from '$lib/supabaseClient';
import type { Character } from '$lib/types/DatabaseTypes';
import { getLocalImages } from '$lib/utils/helpers';
import { getImages } from './serviceHelpers';

export const getCharactersFromQuery = async (query: string, currentGuesses: Character['id'][]) => {
	const { data: characters, error } = await supabase
		.from('characters')
		.select()
		.or(`name.ilike.% ${query}%,name.ilike.${query}%`)
		.not('id', 'in', `(${currentGuesses.join(',')})`);

	if (error) {
		console.error(error.message);
		return [];
	}

	const charactersWithImages = await getImages(characters, supabase, 'characters');
	const charactersWithLocalImages = await getLocalImages(charactersWithImages);

	return charactersWithLocalImages;
};
