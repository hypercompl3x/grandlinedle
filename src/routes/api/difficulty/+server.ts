import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { COOKIE } from '$lib/utils/constants';
import { getMidnightGMT } from '$lib/utils/helpers';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.set(COOKIE.LOCATION_HARD_MODE, 'false', {
		path: '/',
		expires: getMidnightGMT(),
	});

	return json({ success: true });
};
