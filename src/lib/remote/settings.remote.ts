import { getRequestEvent, command } from '$app/server';
import * as v from 'valibot';
import { COOKIE, TEN_YEARS } from '$lib/utils/constants';

export const updateSettings = command(
	v.object({
		enableEasterEggs: v.boolean(),
		soundEffectVolume: v.number(),
		musicVolume: v.number(),
	}),
	async ({ enableEasterEggs, soundEffectVolume, musicVolume }) => {
		const { cookies } = getRequestEvent();

		cookies.set(COOKIE.ENABLE_EASTER_EGGS, enableEasterEggs.toString(), {
			path: '/',
			maxAge: TEN_YEARS,
		});

		cookies.set(COOKIE.SOUND_EFFECT_VOLUME, soundEffectVolume.toString(), {
			path: '/',
			maxAge: TEN_YEARS,
		});

		cookies.set(COOKIE.MUSIC_VOLUME, musicVolume.toString(), {
			path: '/',
			maxAge: TEN_YEARS,
		});
	},
);
