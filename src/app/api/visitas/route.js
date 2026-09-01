import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos el service role para escribir sin restricciones de RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST: registra una visita (upsert — si ya visitó hoy, no duplica)
export async function POST(request) {
  try {
    const { session_id } = await request.json();

    if (!session_id || typeof session_id !== 'string' || session_id.length > 100) {
      return NextResponse.json({ error: 'session_id inválido' }, { status: 400 });
    }

    // Fecha de hoy en zona horaria de Argentina (UTC-3)
    const ahoraArgentina = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const fecha = ahoraArgentina.toISOString().split('T')[0]; // "2026-09-01"

    const { error } = await supabase
      .from('visitas')
      .upsert({ session_id, fecha }, { onConflict: 'session_id,fecha', ignoreDuplicates: true });

    if (error) {
      console.error('Error registrando visita:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error interno en /api/visitas POST:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// GET: devuelve el conteo de visitas de hoy + historial de los últimos 60 días
export async function GET() {
  try {
    const ahoraArgentina = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const hoy = ahoraArgentina.toISOString().split('T')[0];

    // Hace 60 días
    const hace60 = new Date(ahoraArgentina);
    hace60.setDate(hace60.getDate() - 60);
    const desde = hace60.toISOString().split('T')[0];

    // Traemos todas las visitas de los últimos 60 días y agrupamos en JS
    const { data, error } = await supabase
      .from('visitas')
      .select('fecha')
      .gte('fecha', desde)
      .order('fecha', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Agrupamos por fecha
    const porFecha = {};
    for (const row of data || []) {
      porFecha[row.fecha] = (porFecha[row.fecha] || 0) + 1;
    }

    // Convertimos a array ordenado de más reciente a más viejo
    const historial = Object.entries(porFecha)
      .map(([fecha, visitas]) => ({ fecha, visitas }))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));

    const visitasHoy = porFecha[hoy] || 0;

    return NextResponse.json({ visitasHoy, historial, hoy });
  } catch (err) {
    console.error('Error interno en /api/visitas GET:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
