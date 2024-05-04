import type { SupabaseClient } from '@supabase/supabase-js';
import type { Character } from '$lib/types/DatabaseTypes';
import type { Database } from '$lib/types/DatabaseTypes';

const getCharacterImage = async (id: Character['id'], supabase: SupabaseClient<Database>) => {
	const {
		data: { publicUrl },
	} = supabase.storage.from('characters').getPublicUrl(`${id}.png`);

	const res = await fetch(publicUrl, { method: 'GET' });

	if (!res.ok) return '';
	return publicUrl;
};

export const getCharacterImages = async (
	characters: Character[],
	supabase: SupabaseClient<Database>,
) => {
	return await Promise.all(
		characters.map(async c => {
			const url = await getCharacterImage(c.id, supabase);

			return {
				...c,
				url,
			};
		}),
	);
};
