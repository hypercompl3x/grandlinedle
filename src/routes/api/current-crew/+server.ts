import { error } from '@sveltejs/kit';
import sharp from 'sharp';
import type { RequestHandler } from './$types';
import { readSignedImageState } from '$lib/api/state';
import type { CrewImageState } from '$lib/types/ApiTypes';

const ZOOM_MAP = {
	0: 0.1,
	1: 0.25,
	2: 0.4,
	3: 0.5,
	4: 0.7,
	5: 0.95,
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

	const state = readSignedImageState<CrewImageState>(token);

	if (!state) {
		error(403, 'Invalid image state');
	}

	const { guessCount, crewGuessed, crewId } = state;

	const { data, error: imageError } = await supabase.storage
		.from('crews')
		.download(`${crewId}.webp`);

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

	const output =
		zoom === 1
			? await sharpImage.jpeg({ quality: 90 }).toBuffer()
			: await sharpImage
					.extract({
						left,
						top,
						width: cropSize,
						height: cropSize,
					})
					.resize(1280, 720, {
						fit: 'cover',
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
