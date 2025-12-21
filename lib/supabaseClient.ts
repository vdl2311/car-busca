import { createClient } from '@supabase/supabase-js';

// Usamos process.env para acesso a variáveis de ambiente, garantindo compatibilidade com o ambiente de execução e consistência com a API_KEY
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jtjxrygrflzfcgecxwum.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_pbT2clyVvHNfnf9y2gdRYw_SUktXZ3A';

export const supabase = createClient(supabaseUrl, supabaseKey);
