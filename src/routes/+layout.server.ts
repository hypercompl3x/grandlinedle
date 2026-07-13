import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { kv } from '$lib/kv';
import { COOKIE } from '$lib/utils/constants';
import { VERCEL_ENV } from '$env/static/private';

export const load: LayoutServerLoad = async ({ cookies }) => {
	if (VERCEL_ENV !== 'development') {
		const maintenanceEnabled = await kv.get<boolean>('maintenance:enabled');

		if (maintenanceEnabled) {
			error(503, `Grandlinedle is down for planned maintenance. We'll be back soon!`);
		}
	}

	const enableEasterEggs = (cookies.get(COOKIE.ENABLE_EASTER_EGGS) || 'true') === 'true';
	const volume = cookies.get(COOKIE.VOLUME);

	return {
		enableEasterEggs,
		volume: volume ? Number(volume) : 0.7,
	};
};
