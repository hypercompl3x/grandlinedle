import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_API_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Database } from './types/DatabaseTypes';

export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_API_KEY);
