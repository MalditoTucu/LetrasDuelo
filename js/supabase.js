import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://etkulcdxbgwjijtsjlwy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_10uQutsPxFddRpiSvPOo0g_AA5kiu39';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Falta completar la configuración de Supabase en js/supabase.js: definí SUPABASE_URL y SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
