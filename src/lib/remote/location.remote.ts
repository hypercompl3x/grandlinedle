import { getRequestEvent, form } from '$app/server';
import { COOKIE } from '$lib/utils/constants';
import { getMidnightGMT } from '$lib/utils/helpers';

export const switchDifficulty = form(async () => {
	const { cookies } = getRequestEvent();

	cookies.set(COOKIE.LOCATION_HARD_MODE, 'false', {
		path: '/',
		expires: getMidnightGMT(),
	});
});
