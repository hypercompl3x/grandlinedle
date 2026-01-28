import { error, type Cookies } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Actions, PageServerLoad } from './$types';
import { getImages } from '$lib/services/serviceHelpers';
import type { Database, Location } from '$lib/types/DatabaseTypes';
import { getMidnightGMT } from '$lib/utils/helpers';
import { GAME_MODE } from '$lib/utils/constants';

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

const getLocationUrl = async (id: Location['id'], supabase: SupabaseClient<Database>) => {
	const {
		data: { publicUrl },
	} = supabase.storage.from('locations').getPublicUrl(`${id}.webp`);
	return publicUrl;
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

	const url = await getLocationUrl(data.locations.id, supabase);

	return { ...data.locations, url };
};

const getPageData = async (supabase: SupabaseClient<Database>, cookies: Cookies) => ({
	guesses: await getGuesses(supabase, cookies),
	currentLocation: await getCurrentLocation(supabase),
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
		const locationId = data.get('locationId');
		const locationIdNumber = Number(locationId);

		const locationsString = cookies.get('locations') || '[]';
		const locations = JSON.parse(locationsString);

		if (!locations.includes(locationIdNumber)) {
			locations.unshift(locationIdNumber);
		}

		const newLocationsString = JSON.stringify(locations);

		cookies.set('locations', newLocationsString, { path: '/', expires: getMidnightGMT() });

		const currentLocation = await getCurrentLocation(locals.supabase);

		if (currentLocation.id === locationIdNumber) {
			const completedString = cookies.get('completed') || '[]';
			const completed = JSON.parse(completedString);
			completed.unshift(GAME_MODE.LOCATION);
			const newCompletedString = JSON.stringify(completed);
			cookies.set('completed', newCompletedString, { path: '/', expires: getMidnightGMT() });
		}
	},
} satisfies Actions;
