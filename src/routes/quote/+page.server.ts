import { error, type Cookies } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getImages } from '$lib/services/serviceHelpers';
import { getMidnightGMT } from '$lib/utils/helpers';
import type { Database, Quote } from '$lib/types/DatabaseTypes';
import { GAME_MODE } from '$lib/utils/constants';

const getGuesses = async (supabase: SupabaseClient<Database>, cookies: Cookies) => {
	const quoteCharacterGuesses = cookies.get('quotecharacters');

	if (!quoteCharacterGuesses) return [];

	const quoteCharacterGuessesArray = JSON.parse(quoteCharacterGuesses);
	const { data: characters, error: err } = await supabase
		.from('characters')
		.select()
		.in('id', quoteCharacterGuessesArray);

	if (err) {
		error(500, {
			message: 'Failed to fetch locations',
		});
	}

	characters.sort(
		(a, b) => quoteCharacterGuessesArray.indexOf(a.id) - quoteCharacterGuessesArray.indexOf(b.id),
	);

	return await getImages(characters, supabase, 'characters');
};

const getCurrentQuote = async (supabase: SupabaseClient<Database>): Promise<Quote> => {
	const { data, error: err } = await supabase
		.from('current_quote')
		.select('quotes (*, characters (*))')
		.single();

	if (err || !data.quotes || !data.quotes.characters) {
		error(500, {
			message: 'Failed to get current quote',
		});
	}

	const { characters, ...rest } = data.quotes;

	return { ...rest, affiliation: characters.affiliation };
};

const getPageData = async (supabase: SupabaseClient<Database>, cookies: Cookies) => ({
	guesses: await getGuesses(supabase, cookies),
	currentQuote: await getCurrentQuote(supabase),
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

		const quoteCharactersString = cookies.get('quotecharacters') || '[]';
		const quoteCharacters = JSON.parse(quoteCharactersString);

		if (!quoteCharacters.includes(characterIdNumber)) {
			quoteCharacters.unshift(characterIdNumber);
		}

		const newCharactersString = JSON.stringify(quoteCharacters);

		cookies.set('quotecharacters', newCharactersString, { path: '/', expires: getMidnightGMT() });

		const currentQuote = await getCurrentQuote(locals.supabase);

		if (currentQuote.character_id === characterIdNumber) {
			const completedString = cookies.get('completed') || '[]';
			const completed = JSON.parse(completedString);
			completed.unshift(GAME_MODE.QUOTE);
			const newCompletedString = JSON.stringify(completed);
			cookies.set('completed', newCompletedString, { path: '/', expires: getMidnightGMT() });
		}
	},
} satisfies Actions;
