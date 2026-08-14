import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
  try {
    // Obtenemos el código de la URL (por ejemplo: CBA-1234)
    const { codigo } = params;

    // Buscamos el pedido en Supabase
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('codigo_pedido', codigo.toUpperCase().trim())
      .single();

    // Si no existe o hay error, devolvemos un 404
    if (error || !data) {
      return NextResponse.json(
        { error: "No encontramos ningún pedido con este código. Verificá que esté bien escrito." }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, pedido: data });
  } catch (error) {
    console.error('Error buscando pedido:', error);
    return NextResponse.json({ error: "Error interno del servidor al buscar el pedido." }, { status: 500 });
  }
}