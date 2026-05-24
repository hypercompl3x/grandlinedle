import { error, type Cookies } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import type { Actions, PageServerLoad } from './$types';
import { getImages } from '$lib/services/serviceHelpers';
import type { Database, Location } from '$lib/types/DatabaseTypes';
import { getArrayLengthFromCookie, getMidnightGMT } from '$lib/utils/helpers';
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

const getLocationImage = async (id: Location['id'], supabase: SupabaseClient<Database>) => {
	const { data: imageData, error: imageError } = await supabase.storage
		.from('locations')
		.download(`${id}.webp`);

	if (imageError || !imageData) {
		error(500, 'Failed to download location image');
	}

	return Buffer.from(await imageData.arrayBuffer());
};

const getCurrentLocationId = async (supabase: SupabaseClient<Database>) => {
	const { data, error: err } = await supabase
		.from('current_location')
		.select('locations (*)')
		.single();

	if (err || !data.locations) {
		error(500, {
			message: 'Failed to get current location',
		});
	}

	return data.locations.id;
};

const BLUR_MAP = {
	0: 180,
	1: 120,
	2: 70,
	3: 50,
	4: 25,
	5: 10,
};

const getCurrentLocation = async (
	supabase: SupabaseClient<Database>,
	cookies: Cookies,
	guessIds: number[],
) => {
	const { data, error: err } = await supabase
		.from('current_location')
		.select('locations (*)')
		.single();

	if (err || !data.locations) {
		error(500, {
			message: 'Failed to get current location',
		});
	}

	const currentLocation = await getLocationImage(data.locations.id, supabase);

	const locationHasBeenGuessed = guessIds.includes(data.locations.id);
	const locationGuessesLen = getArrayLengthFromCookie(cookies, COOKIE.LOCATIONS);

	const blur =
		locationHasBeenGuessed || locationGuessesLen > 5
			? 0
			: BLUR_MAP[locationGuessesLen as keyof typeof BLUR_MAP];

	const image =
		blur > 0
			? await sharp(currentLocation).blur(blur).jpeg({ quality: 80 }).toBuffer()
			: await sharp(currentLocation).jpeg({ quality: 90 }).toBuffer();

	const url = `data:image/jpeg;base64,${image.toString('base64')}`;

	return { ...data.locations, url };
};

const getPageData = async (supabase: SupabaseClient<Database>, cookies: Cookies) => {
	const guesses = await getGuesses(supabase, cookies);
	const currentLocation = await getCurrentLocation(
		supabase,
		cookies,
		guesses.map(g => g.id),
	);

	return {
		guesses,
		currentLocation,
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

		const currentLocationId = await getCurrentLocationId(locals.supabase);

		if (currentLocationId === locationIdNumber) {
			const completedString = cookies.get(COOKIE.COMPLETED) || '[]';
			const completed = JSON.parse(completedString);
			completed.unshift(GAME_MODE.LOCATION);
			const newCompletedString = JSON.stringify(completed);
			cookies.set(COOKIE.COMPLETED, newCompletedString, { path: '/', expires: getMidnightGMT() });
		}
	},
} satisfies Actions;
