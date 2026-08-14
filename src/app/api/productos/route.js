import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Obliga a Vercel a consultar la base de datos en tiempo real siempre
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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

// NUEVO: Método para crear un producto nuevo desde el panel de administrador
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, price, category, image } = body;

    // Validación básica para asegurar que no falten datos clave
    if (!name || !price || !category || !image) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Insertamos el nuevo producto en Supabase
    const { data, error } = await supabase
      .from('productos')
      .insert([{ name, description, price, category, image }])
      .select();

    if (error) {
      console.error("Error guardando producto en Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, producto: data[0] });
  } catch (error) {
    console.error('Error interno del servidor al guardar:', error);
    return NextResponse.json({ error: "Fallo interno en el servidor" }, { status: 500 });
  }
}