import { supabase } from '$lib/supabaseClient';
import type { Character } from '$lib/types/DatabaseTypes';
import { preloadImage } from '$lib/utils/helpers';
import { getImages } from './serviceHelpers';

export const getCharactersFromQuery = async (query: string, currentGuesses: Character['id'][]) => {
	const { data: characters, error } = await supabase
		.from('characters')
		.select()
		.or(`name.ilike.%${query}%`)
		.not('id', 'in', `(${currentGuesses.join(',')})`);

	if (error) {
		console.error(error.message);
		return [];
	}

	const charactersWithImages = await getImages(characters, supabase, 'characters');

	await Promise.all(charactersWithImages.map(i => preloadImage(i.url)));

	return charactersWithImages;
};
