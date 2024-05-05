import { error, type Cookies } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Actions, PageServerLoad } from './$types';
import { getCharacterImages } from '$lib/services/serviceHelpers';
import type { Database } from '$lib/types/DatabaseTypes';
import { getMidnightGMT } from '$lib/utils/helpers';

const getGuesses = async (supabase: SupabaseClient<Database>, cookies: Cookies) => {
	const characterGuesses = cookies.get('characters');

	if (!characterGuesses) return [];

	const characterGuessesArray = JSON.parse(characterGuesses);
	const { data: characters, error: err } = await supabase
		.from('characters')
		.select()
		.in('id', characterGuessesArray);

	if (err) {
		error(500, {
			message: 'Failed to fetch characters',
		});
	}

	characters.sort(
		(a, b) => characterGuessesArray.indexOf(a.id) - characterGuessesArray.indexOf(b.id),
	);

	return await getCharacterImages(characters, supabase);
};

const getCurrentCharacter = async (supabase: SupabaseClient<Database>) => {
	const { data, error: err } = await supabase
		.from('current_character')
		.select('characters (*)')
		.single();

	if (err || !data.characters) {
		error(500, {
			message: 'Failed to current character',
		});
	}

	return data.characters;
};

export const load: PageServerLoad = async ({ locals: { supabase }, cookies }) => {
	if (!supabase) {
		error(500, {
			message: 'Supabase client is not available',
		});
	}

	return {
		guesses: await getGuesses(supabase, cookies),
		currentCharacter: await getCurrentCharacter(supabase),
	};
};

export const actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		const characterId = data.get('characterId');
		const characterIdNumber = Number(characterId);

		const charactersString = cookies.get('characters') || '[]';
		const characters = JSON.parse(charactersString);

		if (!characters.includes(characterIdNumber)) {
			characters.unshift(characterIdNumber);
		}

		const newCharactersString = JSON.stringify(characters);

		cookies.set('characters', newCharactersString, { path: '/', expires: getMidnightGMT() });
	},
} satisfies Actions;
