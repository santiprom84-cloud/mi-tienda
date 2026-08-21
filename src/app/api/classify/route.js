import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const maxDuration = 60; 

export async function POST(req) {
  try {
    const body = await req.json();
    const { lote } = body; 

    if (!lote || lote.length === 0) {
      return NextResponse.json({ message: "Lote vacío." });
    }

    const prompt = `
      Eres un experto en e-commerce. Analiza estos productos y asígnales una categoría.
      Sugerencias: Tecnología y Gaming, Bazar y Hogar, Deportes y Tiempo Libre, Librería y Estudio, Accesorios y Telefonía.
      REGLA: Si no encajan, PUEDES CREAR NUEVAS categorías cortas (Ej: Juguetería, Indumentaria, Niños, Ferretería). 
      Devuelve SOLO un JSON válido con este formato exacto: [{"id": "id", "category": "Categoria"}]
      Productos:
      ${JSON.stringify(lote.map(p => ({id: p.id, name: p.name, description: p.description})))}
    `;

    // ACTUALIZADO: Apuntando directamente al modelo gemini-1.5-pro
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error("Error desde Gemini:", errData);
      throw new Error(`La API de Gemini rechazó la conexión (Status: ${response.status}). Posible límite de peticiones.`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error.message);
    }

    let text = result.candidates[0].content.parts[0].text;
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("La IA no devolvió un formato JSON válido.");
    }

    const clasificaciones = JSON.parse(jsonMatch[0]);

    // OPTIMIZACIÓN: Guardar todo en Supabase al mismo tiempo (Paralelismo) para ser más rápidos que Vercel
    await Promise.all(clasificaciones.map(item => {
      if(item.id && item.category) {
        return supabase.from('productos').update({ category: item.category }).eq('id', item.id);
      }
    }));

    return NextResponse.json({ success: true, count: clasificaciones.length });
  } catch (error) {
    console.error("Error en el lote:", error);
    return NextResponse.json({ error: error.message || "Fallo en el servidor IA." }, { status: 500 });
  }
}