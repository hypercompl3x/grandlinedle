import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	Character,
	Crew,
	Location,
	Database,
	OnlinePlayer,
	OnlineRoundWithCharacter,
	OnlineGuessWithCharacter,
} from '$lib/types/DatabaseTypes';

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

const getPlayerIconImage = async (
	icon: OnlinePlayer['icon'],
	supabase: SupabaseClient<Database>,
) => {
	const {
		data: { publicUrl },
	} = supabase.storage.from('player_icons').getPublicUrl(`${icon}.png`);
	return publicUrl;
};

const imageFnMap = {
	characters: getCharacterImage,
	locations: getLocationImage,
	crews: getCrewImage,
	icons: getPlayerIconImage,
};

export const getRoundImages = async (
	rounds: OnlineRoundWithCharacter[],
	supabase: SupabaseClient<Database>,
) => {
	return await Promise.all(
		rounds.map(async r => {
			const url = await getCharacterImage(r.character.id, supabase);

			return {
				...r,
				character: {
					...r.character,
					url,
				},
			};
		}),
	);
};

export const getGuessImages = async (
	guesses: OnlineGuessWithCharacter[],
	supabase: SupabaseClient<Database>,
) => {
	return await Promise.all(
		guesses.map(async g => {
			const url = await getCharacterImage(g.character_id, supabase);

			return {
				...g,
				character: {
					...g.character,
					url,
				},
			};
		}),
	);
};

export const getImages = async <T extends { id: number; icon?: number }>(
	items: T[],
	supabase: SupabaseClient<Database>,
	table: keyof typeof imageFnMap,
) => {
	const getImage = imageFnMap[table];
	return await Promise.all(
		items.map(async item => {
			const imageId = 'icon' in item && item.icon ? item.icon : item.id;
			const url = await getImage(imageId, supabase);

			return {
				...item,
				url,
			};
		}),
	);
};
