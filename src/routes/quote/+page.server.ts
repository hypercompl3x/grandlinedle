import { error, type Cookies } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Config } from '@sveltejs/adapter-vercel';
import type { Actions, PageServerLoad } from './$types';
import { getImages } from '$lib/services/serviceHelpers';
import type { Database, Character, Quote } from '$lib/types/DatabaseTypes';
import { getMidnightGMT } from '$lib/utils/helpers';

export const config: Config = {
	runtime: 'edge',
};

type QuoteWithCharacter = Quote & {
	character: Character;
};

const getGuesses = async (supabase: SupabaseClient<Database>, cookies: Cookies) => {
	const quoteGuesses = cookies.get('quotes');

	if (!quoteGuesses) return [];

	const quoteGuessesArray = JSON.parse(quoteGuesses);
	const { data: characters, error: err } = await supabase
		.from('characters')
		.select()
		.in('id', quoteGuessesArray);

	if (err) {
		error(500, {
			message: 'Failed to fetch characters',
		});
	}

	characters.sort((a, b) => quoteGuessesArray.indexOf(a.id) - quoteGuessesArray.indexOf(b.id));

	return await getImages(characters, supabase, 'characters');
};

const getCurrentQuote = async (supabase: SupabaseClient<Database>) => {
	const { data, error: err } = await supabase
		.from('current_quote')
		.select('quotes (*, characters (*))')
		.single();

	if (err || !data.quotes) {
		error(500, {
			message: 'Failed to get current quote',
		});
	}

	// TypeScript needs help understanding the nested structure
	const quote = data.quotes as any;
	const character = quote.characters;

	if (!character) {
		error(500, {
			message: 'Failed to get quote character',
		});
	}

	const charactersWithImages = await getImages([character], supabase, 'characters');

	return {
		id: quote.id,
		quote: quote.quote,
		character_id: quote.character_id,
		created_at: quote.created_at,
		character: charactersWithImages[0],
	} as QuoteWithCharacter;
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
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		const characterId = data.get('characterId');
		const characterIdNumber = Number(characterId);

		const quotesString = cookies.get('quotes') || '[]';
		const quotes = JSON.parse(quotesString);

		if (!quotes.includes(characterIdNumber)) {
			quotes.unshift(characterIdNumber);
		}

		const newQuotesString = JSON.stringify(quotes);

		cookies.set('quotes', newQuotesString, { path: '/', expires: getMidnightGMT() });
	},
} satisfies Actions;
