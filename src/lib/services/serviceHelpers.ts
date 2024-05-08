import type { SupabaseClient } from '@supabase/supabase-js';
import type { Character, Location } from '$lib/types/DatabaseTypes';
import type { Database } from '$lib/types/DatabaseTypes';

const getCharacterImage = async (id: Character['id'], supabase: SupabaseClient<Database>) => {
	const {
		data: { publicUrl },
	} = supabase.storage.from('characters').getPublicUrl(`${id}.png`);

	const res = await fetch(publicUrl, { method: 'GET' });

	if (!res.ok) return '';
	return publicUrl;
};

const getLocationImage = async (id: Location['id'], supabase: SupabaseClient<Database>) => {
	const {
		data: { publicUrl },
	} = supabase.storage.from('locations').getPublicUrl(`${id}.webp`);

	const res = await fetch(publicUrl, { method: 'GET' });

	if (!res.ok) return '';
	return publicUrl;
};

export const getImages = async <T extends { id: number }>(
	items: T[],
	supabase: SupabaseClient<Database>,
	table: 'characters' | 'locations',
) => {
	return await Promise.all(
		items.map(async item => {
			const url =
				table === 'characters'
					? await getCharacterImage(item.id, supabase)
					: await getLocationImage(item.id, supabase);

			return {
				...item,
				url,
			};
		}),
	);
};
