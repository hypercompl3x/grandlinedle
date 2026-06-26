import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { COOKIE } from '$lib/utils/constants';
import { TEN_YEARS } from '$lib/utils/constants';

export const POST: RequestHandler = async ({ cookies, url }) => {
	const hideSuggestionBanner = url.searchParams.get('hideSuggestionBanner');

	if (!hideSuggestionBanner) {
		error(400, 'Missing settings data');
	}

	cookies.set(COOKIE.HIDE_SUGGESTION_BANNER, hideSuggestionBanner, {
		path: '/',
		maxAge: TEN_YEARS,
	});

	return json({ success: true });
};
