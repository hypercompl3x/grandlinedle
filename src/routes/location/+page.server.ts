import { error, type Cookies } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Actions, PageServerLoad } from './$types';
import { getImages } from '$lib/services/serviceHelpers';
import type { Database } from '$lib/types/DatabaseTypes';
import { getMidnightGMT } from '$lib/utils/helpers';
import { COOKIE, GAME_MODE } from '$lib/utils/constants';

const getGuesses = async (supabase: SupabaseClient<Database>, cookies: Cookies) => {
	const locationGuesses = cookies.get('locations');

	if (!locationGuesses) return [];

	const locationGuessesArray = JSON.parse(locationGuesses);
	const { data: locations, error: err } = await supabase
		.from('locations')
		.select()
		.in('id', locationGuessesArray);

	if (err) {
		error(500, {
			message: 'Failed to fetch locations',
		});
	}

	locations.sort((a, b) => locationGuessesArray.indexOf(a.id) - locationGuessesArray.indexOf(b.id));

	return await getImages(locations, supabase, 'locations');
};

const getCurrentLocation = async (supabase: SupabaseClient<Database>) => {
	const { data, error: err } = await supabase
		.from('current_location')
		.select('locations (*)')
		.single();

	if (err || !data.locations) {
		error(500, {
			message: 'Failed to get current location',
		});
	}

	return data.locations;
};

const getPageData = async (supabase: SupabaseClient<Database>, cookies: Cookies) => {
	const [guesses, currentLocation] = await Promise.all([
		getGuesses(supabase, cookies),
		getCurrentLocation(supabase),
	]);

	const guessIds = guesses.map(g => g.id);
	const locationHasBeenGuessed = guessIds.includes(currentLocation.id);

	return {
		guesses,
		currentLocation: {
			...currentLocation,
			url: `/api/current-location/${currentLocation.id}?guessCount=${guessIds.length}&locationGuessed=${locationHasBeenGuessed}`,
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
		const locationId = data.get('locationId');
		const locationIdNumber = Number(locationId);

		const locationsString = cookies.get(COOKIE.LOCATIONS) || '[]';
		const locations = JSON.parse(locationsString);

		if (!locations.includes(locationIdNumber)) {
			locations.unshift(locationIdNumber);
		}

		const newLocationsString = JSON.stringify(locations);

		cookies.set(COOKIE.LOCATIONS, newLocationsString, { path: '/', expires: getMidnightGMT() });

		const currentLocation = await getCurrentLocation(locals.supabase);

		if (currentLocation.id === locationIdNumber) {
			const completedString = cookies.get(COOKIE.COMPLETED) || '[]';
			const completed = JSON.parse(completedString);
			completed.unshift(GAME_MODE.LOCATION);
			const newCompletedString = JSON.stringify(completed);
			cookies.set(COOKIE.COMPLETED, newCompletedString, { path: '/', expires: getMidnightGMT() });
		}
	},
} satisfies Actions;
