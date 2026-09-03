// Cliente Supabase para uso en Client Components y Route Handlers.
// Usa el createClient básico de @supabase/supabase-js que funciona tanto
// en el browser como en el servidor (Route Handlers / Server Actions).
// La persistencia de sesión en Next.js App Router se maneja via @supabase/ssr
// en src/lib/supabase/client.js (browser) y src/lib/supabase/server.js (servidor).
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);