import { error } from '@sveltejs/kit';
import sharp from 'sharp';
import type { RequestHandler } from './$types';

const ZOOM_MAP = {
	0: 0.1,
	1: 0.25,
	2: 0.4,
	3: 0.5,
	4: 0.7,
	5: 0.95,
} as const;

export const GET: RequestHandler = async ({ params, url, locals }) => {
	const supabase = locals.supabase;

	if (!supabase) {
		error(500, 'Supabase client is not available');
	}

	const id = params.id;
	const guessCount = Number(url.searchParams.get('guessCount') ?? 0);
	const crewGuessed = url.searchParams.get('crewGuessed') === 'true';

	const { data, error: imageError } = await supabase.storage.from('crews').download(`${id}.webp`);

	if (imageError || !data) {
		error(404, 'Crew image not found');
	}

	const input = Buffer.from(await data.arrayBuffer());

	const sharpImage = sharp(input);
	const metadata = await sharpImage.metadata();

	if (!metadata.width || !metadata.height) {
		error(500, 'Invalid crew image');
	}

	const zoom = crewGuessed || guessCount > 5 ? 1 : ZOOM_MAP[guessCount as keyof typeof ZOOM_MAP];

	const shortestSide = Math.min(metadata.width, metadata.height);
	const cropSize = Math.round(shortestSide * zoom);

	const left = Math.floor((metadata.width - cropSize) / 2);
	const top = Math.floor((metadata.height - cropSize) / 2);

	const output = await sharpImage
		.extract({
			left,
			top,
			width: cropSize,
			height: cropSize,
		})
		.resize(1280, 720, {
			fit: zoom === 1 ? 'contain' : 'cover',
		})
		.jpeg({ quality: 90 })
		.toBuffer();

	return new Response(new Uint8Array(output), {
		headers: {
			'content-type': 'image/jpeg',
			'cache-control': 'public, max-age=86400',
		},
	});
};
