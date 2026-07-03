import { getRequestEvent, form } from '$app/server';
import * as v from 'valibot';
import { COOKIE } from '$lib/utils/constants';
import { getMidnightGMT } from '$lib/utils/helpers';

export const updateSettings = form(
	v.object({
		hideSuggestionBanner: v.optional(v.boolean(), false),
	}),
	async ({ hideSuggestionBanner }) => {
		const { cookies } = getRequestEvent();

		cookies.set(COOKIE.HIDE_SUGGESTION_BANNER, hideSuggestionBanner.toString(), {
			path: '/',
			expires: getMidnightGMT(),
		});
	},
);
