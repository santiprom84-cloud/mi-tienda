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

    // Adaptamos ligeramente el prompt para Llama 3
    const prompt = `
      Eres un experto en e-commerce. Analiza estos productos y asígnales una categoría.
      Sugerencias: Tecnología y Gaming, Bazar y Hogar, Deportes y Tiempo Libre, Librería y Estudio, Accesorios y Telefonía.
      REGLA: Si no encajan, CREA NUEVAS categorías cortas (Ej: Juguetería, Indumentaria, Niños, Ferretería). 
      Devuelve SOLO un JSON válido con este formato exacto que contenga el array 'productos':
      { "productos": [{"id": "id_del_producto", "category": "Categoria"}] }
      
      Productos a clasificar:
      ${JSON.stringify(lote.map(p => ({id: p.id, name: p.name, description: p.description})))}
    `;

    // Conectamos con la API ultrarrápida de Groq usando Llama 3
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Modelo súper rápido y gratuito
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }, // Forzamos JSON perfecto
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error("Error desde Groq:", errData);
      throw new Error(`Groq rechazó la conexión (Status: ${response.status}).`);
    }

    const result = await response.json();
    const text = result.choices[0].message.content;
    
    // Extraemos el JSON
    const parsedData = JSON.parse(text);
    const clasificaciones = parsedData.productos;

    if (!clasificaciones || !Array.isArray(clasificaciones)) {
      throw new Error("La IA no devolvió el array de productos correctamente.");
    }

    // Guardamos en Supabase
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