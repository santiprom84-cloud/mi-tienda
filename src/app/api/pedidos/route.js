import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { codigo_pedido, nombre_cliente, productos, total } = body;

    // Guardamos el pedido en la tabla 'pedidos' de Supabase
    const { data, error } = await supabase
      .from('pedidos')
      .insert([
        { 
          codigo_pedido, 
          nombre_cliente, 
          productos, 
          total, 
          estado: 'pendiente' 
        }
      ])
      .select();

    if (error) {
      console.error("Error de Supabase:", error);
      // Devolvemos el error exacto de la base de datos al frontend
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, pedido: data[0] });
  } catch (error) {
    console.error('Error guardando pedido:', error);
    return NextResponse.json({ error: "Fallo interno en el servidor: " + error.message }, { status: 500 });
  }
}