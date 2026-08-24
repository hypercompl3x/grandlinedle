import { error, type Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { createServerClient } from '@supabase/ssr';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '$lib/kv';
import type { Database } from '$lib/types/DatabaseTypes';

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_API_KEY } from '$env/static/public';
import { VERCEL_ENV } from '$env/static/private';

const ratelimit = new Ratelimit({
	redis: kv,
	limiter: Ratelimit.slidingWindow(12, '10 s'),
});

export const handle: Handle = async ({ event, resolve }) => {
	if (!building && VERCEL_ENV !== 'development') {
		const ip = event.getClientAddress() || '127.0.0.1';

		const { success, reset } = await ratelimit.limit(ip);

		if (!success) {
			const timeRemaining = Math.floor((reset - new Date().getTime()) / 1000);
			error(429, {
				message: `Too many requests. Please try again in ${timeRemaining} seconds.`,
			});
		}
	}

	event.locals.supabase = createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_API_KEY,
		{
			cookies: {
				getAll() {
					return event.cookies.getAll();
				},
				setAll(cookiesToSet, headers) {
					cookiesToSet.forEach(({ name, value, options }) =>
						event.cookies.set(name, value, { ...options, path: '/' }),
					);
					if (Object.keys(headers).length > 0) {
						event.setHeaders(headers);
					}
				},
			},
		},
	);

	const getSessionAndUser = async () => {
		const {
			data: { session },
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			return {
				session: null,
				user: null,
			};
		}

		const {
			data: { user },
			error,
		} = await event.locals.supabase.auth.getUser();
		if (error || !user) {
			return {
				session: null,
				user: null,
			};
		}

		return {
			session,
			user,
		};
	};

	const { session, user } = await getSessionAndUser();

	event.locals.session = session;
	event.locals.user = user;

	const response = await resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		},
	});

	return response;
};
