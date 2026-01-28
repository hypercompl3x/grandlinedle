import { error, type Cookies } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Actions, PageServerLoad } from './$types';
import { getImages } from '$lib/services/serviceHelpers';
import type { Database } from '$lib/types/DatabaseTypes';
import { getMidnightGMT } from '$lib/utils/helpers';
import { GAME_MODE } from '$lib/utils/constants';

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

	return await getImages(characters, supabase, 'characters');
};

const getCurrentCharacter = async (supabase: SupabaseClient<Database>) => {
	const { data, error: err } = await supabase
		.from('current_character')
		.select('characters (*)')
		.single();

	if (err || !data.characters) {
		error(500, {
			message: 'Failed to get current character',
		});
	}

	return data.characters;
};

const getPageData = async (supabase: SupabaseClient<Database>, cookies: Cookies) => ({
	guesses: await getGuesses(supabase, cookies),
	currentCharacter: await getCurrentCharacter(supabase),
});

export const load: PageServerLoad = async ({ locals: { supabase }, cookies }) => {
	if (!supabase) {
		error(500, {
			message: 'Supabase client is not available',
		});
	}

	return {
		pageData: getPageData(supabase, cookies),
	};
};

export const actions = {
	default: async ({ cookies, request, locals }) => {
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

		const currentCharacter = await getCurrentCharacter(locals.supabase);

		if (currentCharacter.id === characterIdNumber) {
			const completedString = cookies.get('completed') || '[]';
			const completed = JSON.parse(completedString);
			completed.unshift(GAME_MODE.CHARACTER);
			const newCompletedString = JSON.stringify(completed);
			cookies.set('completed', newCompletedString, { path: '/', expires: getMidnightGMT() });
		}
	},
} satisfies Actions;
