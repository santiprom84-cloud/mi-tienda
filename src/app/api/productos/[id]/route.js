import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request, context) {
  try {
    // Leemos el ID que viene en la URL de forma asíncrona (estándar moderno de Next.js)
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "ID de producto no proporcionado." }, { status: 400 });
    }

    // Buscamos el producto específico en Supabase
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error("Error técnico de Supabase:", error);
      return NextResponse.json({ error: "Fallo en la base de datos." }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ success: true, producto: data });

  } catch (error) {
    console.error('Error CRÍTICO buscando producto:', error);
    return NextResponse.json({ error: `Fallo del sistema: ${error.message}` }, { status: 500 });
  }
}