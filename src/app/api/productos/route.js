import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Buscamos todos los productos en Supabase ordenados por los más nuevos primero
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error trayendo productos de Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, productos: data });
  } catch (error) {
    console.error('Error interno del servidor:', error);
    return NextResponse.json({ error: "Fallo interno en el servidor" }, { status: 500 });
  }
}