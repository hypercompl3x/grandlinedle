import { getRequestEvent, form } from '$app/server';
import * as v from 'valibot';
import { COOKIE } from '$lib/utils/constants';
import { getMidnightGMT } from '$lib/utils/helpers';

export const updateSettings = form(
	v.object({
		enableEasterEggs: v.optional(v.boolean(), false),
	}),
	async ({ enableEasterEggs }) => {
		const { cookies } = getRequestEvent();

		cookies.set(COOKIE.ENABLE_EASTER_EGGS, enableEasterEggs.toString(), {
			path: '/',
			expires: getMidnightGMT(),
		});
	},
);
