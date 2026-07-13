import { getRequestEvent, command } from '$app/server';
import * as v from 'valibot';
import { COOKIE, TEN_YEARS } from '$lib/utils/constants';

export const updateSettings = command(
	v.object({
		enableEasterEggs: v.boolean(),
		volume: v.number(),
	}),
	async ({ enableEasterEggs, volume }) => {
		const { cookies } = getRequestEvent();

		cookies.set(COOKIE.ENABLE_EASTER_EGGS, enableEasterEggs.toString(), {
			path: '/',
			maxAge: TEN_YEARS,
		});

		cookies.set(COOKIE.VOLUME, volume.toString(), {
			path: '/',
			maxAge: TEN_YEARS,
		});
	},
);
