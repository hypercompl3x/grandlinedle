import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sharp from 'sharp';
import { readSignedImageState } from '$lib/api/state';
import type { LocationImageState } from '$lib/types/ApiTypes';

const BLUR_MAP = {
	0: 180,
	1: 120,
	2: 70,
	3: 50,
	4: 25,
	5: 10,
} as const;

const HARD_MODE_BLUR_MAP = {
	0: 110,
	1: 90,
	2: 80,
	3: 60,
	4: 40,
	5: 20,
} as const;

export const GET: RequestHandler = async ({ url, locals }) => {
	const supabase = locals.supabase;

	if (!supabase) {
		error(500, 'Supabase client is not available');
	}

	const token = url.searchParams.get('state');

	if (!token) {
		error(400, 'Missing image state');
	}

	const state = readSignedImageState<LocationImageState>(token);

	if (!state) {
		error(403, 'Invalid image state');
	}

	const { guessCount, isHardMode, locationGuessed, locationId } = state;

	const { data, error: imageError } = await supabase.storage
		.from('locations')
		.download(`${locationId}.webp`);

	if (imageError || !data) {
		error(404, 'Location image not found');
	}

	const input = Buffer.from(await data.arrayBuffer());

	const sharpImage = sharp(input);

	const blur =
		locationGuessed || guessCount > 5
			? 0
			: isHardMode
				? HARD_MODE_BLUR_MAP[guessCount as keyof typeof BLUR_MAP]
				: BLUR_MAP[guessCount as keyof typeof BLUR_MAP];

	const output =
		blur > 0
			? await sharpImage.blur(blur).jpeg({ quality: 80 }).grayscale(isHardMode).toBuffer()
			: await sharpImage
					.jpeg({ quality: 90 })
					.grayscale(isHardMode && !locationGuessed)
					.toBuffer();

	return new Response(new Uint8Array(output), {
		headers: {
			'content-type': 'image/jpeg',
			'cache-control': 'public, max-age=86400',
		},
	});
};
