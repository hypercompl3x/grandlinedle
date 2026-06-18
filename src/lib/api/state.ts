import { createHmac, timingSafeEqual } from 'node:crypto';
import { API_STATE_SECRET } from '$env/static/private';

export function createSignedImageState<T>(state: T) {
	const payload = Buffer.from(JSON.stringify(state)).toString('base64url');

	const signature = createHmac('sha256', API_STATE_SECRET).update(payload).digest('base64url');

	return `${payload}.${signature}`;
}

export function readSignedImageState<T>(token: string): T | null {
	const [payload, signature] = token.split('.');

	if (!payload || !signature) {
		return null;
	}

	const expectedSignature = createHmac('sha256', API_STATE_SECRET)
		.update(payload)
		.digest('base64url');

	const actual = Buffer.from(signature);
	const expected = Buffer.from(expectedSignature);

	if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
		return null;
	}

	try {
		return JSON.parse(Buffer.from(payload, 'base64url').toString());
	} catch {
		return null;
	}
}
