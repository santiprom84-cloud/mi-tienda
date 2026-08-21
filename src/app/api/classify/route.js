import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 1. EXTENDEMOS EL TIEMPO DE VERCEL: Le damos hasta 60 segundos para que la IA trabaje tranquila
export const maxDuration = 60; 

export async function POST() {
  try {
    const { data: productos, error: dbError } = await supabase.from('productos').select('id, name, description, category');
    
    if (dbError) throw dbError;

    if (!productos || productos.length === 0) {
      return NextResponse.json({ message: "No hay productos en la base de datos para clasificar." });
    }

    let totalClasificados = 0;
    const tamañoLote = 40; // 2. PROCESAMOS EN LOTES: De a 40 productos por vez

    // Procesamos el catálogo en partes para no saturar a la IA ni a Vercel
    for (let i = 0; i < productos.length; i += tamañoLote) {
      const lote = productos.slice(i, i + tamañoLote);

      const prompt = `
        Eres un experto en e-commerce y organización de inventarios. Analiza estos productos y asígnales la categoría más adecuada.
        
        Puedes usar estas categorías principales como inspiración:
        - Tecnología y Gaming
        - Bazar y Hogar
        - Deportes y Tiempo Libre
        - Librería y Estudio
        - Accesorios y Telefonía

        REGLA VITAL: Si encuentras productos que claramente NO encajan en estas opciones (por ejemplo, juguetes, ropa, herramientas), TIENES TOTAL PERMISO para crear NUEVAS categorías (Ej: "Juguetería", "Indumentaria", "Ferretería"). 
        
        Devuelve UNICAMENTE un arreglo JSON válido, sin texto adicional, sin formato markdown y sin explicaciones:
        [{"id": "id_del_producto", "category": "Categoria Asignada"}]

        Productos a clasificar:
        ${JSON.stringify(lote.map(p => ({id: p.id, name: p.name, description: p.description})))}
      `;

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
      
      // 3. CAZADOR DE JSON: Buscamos extraer solo lo que esté entre los corchetes cuadrados [...]
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("La IA no devolvió un formato JSON reconocible en este lote.");
      }

      const clasificaciones = JSON.parse(jsonMatch[0]);

      // Guardamos este lote en la base de datos
      for (const item of clasificaciones) {
        await supabase.from('productos').update({ category: item.category }).eq('id', item.id);
        totalClasificados++;
      }
    }

    return NextResponse.json({ message: `¡Éxito total! La IA analizó y reordenó ${totalClasificados} productos, adaptando las categorías automáticamente por lotes.` });
  } catch (error) {
    console.error("Error detallado en la clasificación IA:", error);
    return NextResponse.json({ error: "Fallo la conexión con la IA o el formato devuelto. Verifica tu API Key o intentá de nuevo." }, { status: 500 });
  }
}