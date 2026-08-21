import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // 1. Traemos los productos de Supabase
    const { data: productos, error: dbError } = await supabase.from('productos').select('id, name, description, category');
    if (dbError) throw dbError;

    // 2. Filtramos solo los productos que necesitan categoría
    const productosAClasificar = productos.filter(p => !p.category || p.category === 'Todas' || p.category.trim() === '');

    if (productosAClasificar.length === 0) {
      return NextResponse.json({ message: "¡Todo tu catálogo ya está ordenado en categorías!" });
    }

    // 3. Preparamos la orden para la IA
    const prompt = `
      Eres un experto en e-commerce. Tu tarea es analizar los siguientes productos y asignarles UNA de estas 5 categorías exactas:
      - Tecnología y Gaming
      - Bazar y Parrilla
      - Deportes y Tiempo Libre
      - Librería y Estudio
      - Accesorios y Telefonía

      Devuelve UNICAMENTE un JSON válido con el siguiente formato, sin texto adicional ni formato markdown:
      [{"id": "id_del_producto", "category": "Categoria Asignada"}]

      Productos a clasificar:
      ${JSON.stringify(productosAClasificar.map(p => ({id: p.id, name: p.name, description: p.description})))}
    `;

    // 4. Llamamos a la API gratuita de Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    const result = await response.json();
    const text = result.candidates[0].content.parts[0].text;
    const clasificaciones = JSON.parse(text);

    // 5. Actualizamos Supabase con las decisiones de la IA
    for (const item of clasificaciones) {
      await supabase.from('productos').update({ category: item.category }).eq('id', item.id);
    }

    return NextResponse.json({ message: `¡Éxito! La IA ordenó y clasificó ${clasificaciones.length} productos automáticamente.` });
  } catch (error) {
    console.error("Error en clasificación IA:", error);
    return NextResponse.json({ error: "Fallo la conexión con la IA. Verifica tu API Key." }, { status: 500 });
  }
}