import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // 1. Traemos TODOS los productos de Supabase
    const { data: productos, error: dbError } = await supabase.from('productos').select('id, name, description, category');
    
    if (dbError) throw dbError;

    if (!productos || productos.length === 0) {
      return NextResponse.json({ message: "No hay productos en la base de datos para clasificar." });
    }

    // 2. NUEVO PROMPT: Libertad para crear categorías
    const prompt = `
      Eres un experto en e-commerce y organización de inventarios. Tu tarea es analizar TODOS los siguientes productos y asignarles la categoría más adecuada, ignorando cualquier categoría que tengan actualmente. 
      
      Puedes usar estas categorías principales como inspiración:
      - Tecnología y Gaming
      - Bazar y Hogar
      - Deportes y Tiempo Libre
      - Librería y Estudio
      - Accesorios y Telefonía

      REGLA VITAL: Si encuentras productos que claramente NO encajan en estas opciones (por ejemplo, juguetes, ropa, herramientas, repuestos, etc.), TIENES TOTAL PERMISO para crear y asignar NUEVAS categorías. Que sean nombres cortos, profesionales y descriptivos (Ej: "Juguetería", "Indumentaria", "Ferretería"). 
      Trata de agrupar inteligentemente para no crear 50 categorías distintas.

      Devuelve UNICAMENTE un arreglo JSON válido con el siguiente formato EXACTO, sin texto adicional, sin saludos y sin formato markdown:
      [{"id": "id_del_producto", "category": "Categoria Asignada"}]

      Productos a clasificar:
      ${JSON.stringify(productos.map(p => ({id: p.id, name: p.name, description: p.description})))}
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
      console.error("Error devuelto por Gemini:", result.error);
      throw new Error(result.error.message);
    }

    let text = result.candidates[0].content.parts[0].text;
    
    // 4. FILTRO ANTI-ERRORES: Limpiamos el texto por si Gemini mandó comillas de código (Markdown)
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const clasificaciones = JSON.parse(text);

    // 5. Actualizamos Supabase
    for (const item of clasificaciones) {
      await supabase.from('productos').update({ category: item.category }).eq('id', item.id);
    }

    return NextResponse.json({ message: `¡Éxito total! La IA analizó y reordenó ${clasificaciones.length} productos, adaptando las categorías automáticamente.` });
  } catch (error) {
    console.error("Error en clasificación IA:", error);
    return NextResponse.json({ error: "Fallo la conexión con la IA o el formato devuelto. Verifica tu API Key o intentá de nuevo." }, { status: 500 });
  }
}