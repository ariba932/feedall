import { createClientComponentClient as createSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

export const createClientComponentClient = () => createSupabaseClient<Database>();
