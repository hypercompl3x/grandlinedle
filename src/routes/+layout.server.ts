import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { kv } from '$lib/kv';
import { COOKIE, DEFAULT_VOLUME } from '$lib/utils/constants';
import { VERCEL_ENV } from '$env/static/private';

export const load: LayoutServerLoad = async ({ cookies }) => {
	if (VERCEL_ENV !== 'development') {
		const maintenanceEnabled = await kv.get<boolean>('maintenance:enabled');

		if (maintenanceEnabled) {
			error(503, `Grandlinedle is down for planned maintenance. We'll be back soon!`);
		}
	}

	const enableEasterEggs = (cookies.get(COOKIE.ENABLE_EASTER_EGGS) || 'true') === 'true';
	const soundEffectVolume = cookies.get(COOKIE.SOUND_EFFECT_VOLUME);
	const musicVolume = cookies.get(COOKIE.MUSIC_VOLUME);

	return {
		enableEasterEggs,
		soundEffectVolume: soundEffectVolume ? Number(soundEffectVolume) : DEFAULT_VOLUME,
		musicVolume: musicVolume ? Number(musicVolume) : DEFAULT_VOLUME,
	};
};
