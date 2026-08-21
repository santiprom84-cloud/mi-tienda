import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Le damos el máximo de tiempo posible por si acaso
export const maxDuration = 60; 

export async function POST(req) {
  try {
    // 1. Recibimos el "lote" de 30 productos desde tu panel de admin
    const body = await req.json();
    const { lote } = body; 

    if (!lote || lote.length === 0) {
      return NextResponse.json({ message: "Lote vacío." });
    }

    // 2. Le damos la instrucción a Gemini con libertad total de categorías
    const prompt = `
      Eres un experto en e-commerce y organización de inventarios. Analiza estos productos y asígnales la categoría más adecuada.
      
      Puedes usar estas categorías principales como inspiración:
      - Tecnología y Gaming
      - Bazar y Hogar
      - Deportes y Tiempo Libre
      - Librería y Estudio
      - Accesorios y Telefonía

      REGLA VITAL: Si encuentras productos que claramente NO encajan en estas opciones (por ejemplo, juguetes, ropa, herramientas), TIENES TOTAL PERMISO para crear NUEVAS categorías (Ej: "Niños", "Juguetería", "Indumentaria", "Ferretería"). 
      Que sean nombres cortos, profesionales y descriptivos.

      Devuelve UNICAMENTE un arreglo JSON válido, sin texto adicional, sin formato markdown y sin explicaciones:
      [{"id": "id_del_producto", "category": "Categoria Asignada"}]

      Productos a clasificar:
      ${JSON.stringify(lote.map(p => ({id: p.id, name: p.name, description: p.description})))}
    `;

    // 3. Llamamos a Gemini
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

    let text = result.candidates[0].content.parts[0].text;
    
    // 4. Limpiamos cualquier "basura" que mande la IA en el texto
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("La IA devolvió un formato incorrecto.");
    }

    const clasificaciones = JSON.parse(jsonMatch[0]);

    // 5. Guardamos las categorías nuevas de este lote
    for (const item of clasificaciones) {
      await supabase.from('productos').update({ category: item.category }).eq('id', item.id);
    }

    return NextResponse.json({ success: true, count: clasificaciones.length });
  } catch (error) {
    console.error("Error en el lote:", error);
    return NextResponse.json({ error: "Falló la conexión con la IA en este lote." }, { status: 500 });
  }
}