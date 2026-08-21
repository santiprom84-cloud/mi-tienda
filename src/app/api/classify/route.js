import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // 1. Traemos TODOS los productos de Supabase sin importar su categoría actual
    const { data: productos, error: dbError } = await supabase.from('productos').select('id, name, description, category');
    
    if (dbError) throw dbError;

    if (!productos || productos.length === 0) {
      return NextResponse.json({ message: "No hay productos en la base de datos para clasificar." });
    }

    // 2. Preparamos la orden para la IA exigiéndole que re-evalúe todo
    const prompt = `
      Eres un experto en e-commerce. Tu tarea es analizar TODOS los siguientes productos y reasignarles la categoría más adecuada, ignorando cualquier categoría que tengan actualmente. 
      Debes usar ÚNICAMENTE UNA de estas 5 categorías exactas para cada producto:
      - Tecnología y Gaming
      - Bazar y Parrilla
      - Deportes y Tiempo Libre
      - Librería y Estudio
      - Accesorios y Telefonía

      Devuelve UNICAMENTE un JSON válido con el siguiente formato, sin texto adicional ni formato markdown:
      [{"id": "id_del_producto", "category": "Categoria Asignada"}]

      Productos a clasificar:
      ${JSON.stringify(productos.map(p => ({id: p.id, name: p.name, description: p.description})))}
    `;

    // 3. Llamamos a la API gratuita de Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error.message);
    }

    const text = result.candidates[0].content.parts[0].text;
    const clasificaciones = JSON.parse(text);

    // 4. Actualizamos Supabase con las NUEVAS decisiones de la IA
    for (const item of clasificaciones) {
      await supabase.from('productos').update({ category: item.category }).eq('id', item.id);
    }

    return NextResponse.json({ message: `¡Éxito total! La IA analizó y reordenó ${clasificaciones.length} productos en sus categorías ideales.` });
  } catch (error) {
    console.error("Error en clasificación IA:", error);
    return NextResponse.json({ error: "Fallo la conexión con la IA. Verifica tu API Key o intentá de nuevo." }, { status: 500 });
  }
}