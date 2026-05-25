import { error } from '@sveltejs/kit';
import sharp from 'sharp';
import type { RequestHandler } from './$types';

const BLUR_MAP = {
	0: 180,
	1: 120,
	2: 70,
	3: 50,
	4: 25,
	5: 10,
} as const;

export const GET: RequestHandler = async ({ params, url, locals }) => {
	const supabase = locals.supabase;

	if (!supabase) {
		error(500, 'Supabase client is not available');
	}

	const id = params.id;
	const guessCount = Number(url.searchParams.get('guessCount') ?? 0);
	const locationGuessed = url.searchParams.get('locationGuessed') === 'true';

	const { data, error: imageError } = await supabase.storage
		.from('locations')
		.download(`${id}.webp`);

	if (imageError || !data) {
		error(404, 'Location image not found');
	}

	const input = Buffer.from(await data.arrayBuffer());

	const sharpImage = sharp(input);

	const blur =
		locationGuessed || guessCount > 5 ? 0 : BLUR_MAP[guessCount as keyof typeof BLUR_MAP];

	const output =
		blur > 0
			? await sharpImage.blur(blur).jpeg({ quality: 80 }).toBuffer()
			: await sharpImage.jpeg({ quality: 90 }).toBuffer();

	return new Response(new Uint8Array(output), {
		headers: {
			'content-type': 'image/jpeg',
			'cache-control': 'public, max-age=86400',
		},
	});
};
