import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	if (!supabase) throw new Error('Supabase client is not available');

	const { data } = await supabase.from('current_character').select();
	return {
		countries: data ?? [],
	};
};
