import { error, type Cookies } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Actions, PageServerLoad } from './$types';
import { getImages } from '$lib/services/serviceHelpers';
import type { Database } from '$lib/types/DatabaseTypes';
import { getMidnightGMT } from '$lib/utils/helpers';
import { COOKIE, GAME_MODE } from '$lib/utils/constants';

const getGuesses = async (supabase: SupabaseClient<Database>, cookies: Cookies) => {
	const crewGuesses = cookies.get(COOKIE.CREWS);

	if (!crewGuesses) return [];

	const crewGuessesArray = JSON.parse(crewGuesses);
	const { data: crews, error: err } = await supabase
		.from('crews')
		.select()
		.in('id', crewGuessesArray);

	if (err) {
		error(500, {
			message: 'Failed to fetch locations',
		});
	}

	crews.sort((a, b) => crewGuessesArray.indexOf(a.id) - crewGuessesArray.indexOf(b.id));

	return await getImages(crews, supabase, 'crews');
};

const getCurrentCrew = async (supabase: SupabaseClient<Database>) => {
	const { data, error: err } = await supabase.from('current_crew').select('crews (*)').single();

	if (err || !data.crews) {
		error(500, {
			message: 'Failed to get current crew',
		});
	}

	return data.crews;
};

const getPageData = async (supabase: SupabaseClient<Database>, cookies: Cookies) => {
	const [guesses, currentCrew] = await Promise.all([
		getGuesses(supabase, cookies),
		getCurrentCrew(supabase),
	]);

	const guessIds = guesses.map(g => g.id);
	const crewHasBeenGuessed = guessIds.includes(currentCrew.id);

	return {
		guesses,
		currentCrew: {
			...currentCrew,
			url: `/api/current-crew/${currentCrew.id}?guessCount=${guessIds.length}&crewGuessed=${crewHasBeenGuessed}`,
		},
	};
};

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
		const crewId = data.get('crewId');
		const crewIdNumber = Number(crewId);

		const crewsString = cookies.get(COOKIE.CREWS) || '[]';
		const crews = JSON.parse(crewsString);

		if (!crews.includes(crewIdNumber)) {
			crews.unshift(crewIdNumber);
		}

		const newCrewsString = JSON.stringify(crews);

		cookies.set(COOKIE.CREWS, newCrewsString, { path: '/', expires: getMidnightGMT() });

		const currentCrew = await getCurrentCrew(locals.supabase);

		if (currentCrew.id === crewIdNumber) {
			const completedString = cookies.get(COOKIE.COMPLETED) || '[]';
			const completed = JSON.parse(completedString);
			completed.unshift(GAME_MODE.CREW);
			const newCompletedString = JSON.stringify(completed);
			cookies.set(COOKIE.COMPLETED, newCompletedString, { path: '/', expires: getMidnightGMT() });
		}
	},
} satisfies Actions;
