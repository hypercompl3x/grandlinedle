import { error, type Handle } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import { Ratelimit } from '@upstash/ratelimit';
import { createClient } from '@vercel/kv';
import type { Database } from '$lib/types/DatabaseTypes';

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_API_KEY } from '$env/static/public';
import { KV_REST_API_URL, KV_REST_API_TOKEN } from '$env/static/private';

const kv = createClient({
	url: KV_REST_API_URL,
	token: KV_REST_API_TOKEN,
});

const ratelimit = new Ratelimit({
	redis: kv,
	limiter: Ratelimit.slidingWindow(5, '10 s'),
});

export const handle: Handle = async ({ event, resolve }) => {
	const ip = event.getClientAddress() || '127.0.0.1';

	const { success, reset } = await ratelimit.limit(ip);

	if (!success) {
		const timeRemaining = Math.floor((reset - new Date().getTime()) / 1000);
		error(429, {
			message: `Too many requests. Please try again in ${timeRemaining} seconds.`,
		});
	}

	event.locals.supabase = createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_API_KEY,
		{
			cookies: {
				get: key => event.cookies.get(key),
				set: (key, value, options) => {
					event.cookies.set(key, value, { ...options, path: '/' });
				},
				remove: (key, options) => {
					event.cookies.delete(key, { ...options, path: '/' });
				},
			},
		},
	);

	const response = await resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		},
	});

	return response;
};
