import type { SupabaseClient } from '@supabase/supabase-js';
import type { Character, Crew, Location, Database } from '$lib/types/DatabaseTypes';

const getCharacterImage = async (id: Character['id'], supabase: SupabaseClient<Database>) => {
	const {
		data: { publicUrl },
	} = supabase.storage.from('characters').getPublicUrl(`${id}.png`);
	return publicUrl;
};

const getLocationImage = async (id: Location['id'], supabase: SupabaseClient<Database>) => {
	const {
		data: { publicUrl },
	} = supabase.storage.from('locations').getPublicUrl(`${id}.webp`);
	return publicUrl;
};

const getCrewImage = async (id: Crew['id'], supabase: SupabaseClient<Database>) => {
	const {
		data: { publicUrl },
	} = supabase.storage.from('crews').getPublicUrl(`${id}.webp`);
	return publicUrl;
};

const imageFnMap = {
	characters: getCharacterImage,
	locations: getLocationImage,
	crews: getCrewImage,
};

export const getImages = async <T extends { id: number }>(
	items: T[],
	supabase: SupabaseClient<Database>,
	table: keyof typeof imageFnMap,
) => {
	const getImage = imageFnMap[table];
	return await Promise.all(
		items.map(async item => {
			const url = await getImage(item.id, supabase);

			return {
				...item,
				url,
			};
		}),
	);
};
