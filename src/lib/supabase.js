// Re-exportamos el cliente browser para compatibilidad con el código existente
// que importa desde '@/lib/supabase'
import { createClient } from './supabase/client';

export const supabase = createClient();