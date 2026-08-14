import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request, context) {
  try {
    // 1. Extraemos el parámetro de forma segura para las últimas versiones de Next.js
    const params = await context.params;
    const codigoRaw = params?.codigo;

    if (!codigoRaw) {
      return NextResponse.json(
        { error: "No se proporcionó ningún código para buscar." }, 
        { status: 400 }
      );
    }

    // 2. Limpiamos el código. Por más que el frontend lo envíe limpio, el backend siempre debe desconfiar.
    const codigoLimpio = codigoRaw.replace('#', '').toUpperCase().trim();

    // 3. Buscamos en Supabase usando maybeSingle()
    // maybeSingle() es vital: si no encuentra nada, devuelve data = null en vez de romper el servidor.
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('codigo_pedido', codigoLimpio)
      .maybeSingle();

    // Si Supabase tuvo un problema real de conexión
    if (error) {
      console.error("Error técnico de Supabase:", error);
      return NextResponse.json(
        { error: "Fallo en la base de datos al buscar tu pedido. Intentá en unos minutos." }, 
        { status: 500 }
      );
    }

    // Si la conexión fue exitosa, pero no hay ningún pedido con ese código
    if (!data) {
      return NextResponse.json(
        { error: "No encontramos tu pedido. Verificá que el código sea exactamente el que te enviamos." }, 
        { status: 404 }
      );
    }

    // ¡Éxito! Devolvemos el pedido completo al cliente para que pague
    return NextResponse.json({ success: true, pedido: data });

  } catch (error) {
    // Si algo falla catastróficamente, capturamos el error real para saber qué pasó
    console.error('Error CRÍTICO en el servidor buscando pedido:', error);
    return NextResponse.json(
      { error: `Fallo del sistema: ${error.message}` }, 
      { status: 500 }
    );
  }
}