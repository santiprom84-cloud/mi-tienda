import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "El nombre del producto es obligatorio." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Falta la variable GEMINI_API_KEY en Vercel." }, { status: 500 });
    }

    const prompt = `
      Eres un experto en e-commerce. Asigna UNA categoría corta a este producto.
      Sugerencias: "Tecnología y Gaming", "Bazar y Hogar", "Deportes y Tiempo Libre", "Librería y Estudio", "Accesorios", "Indumentaria", "Juguetería", "Ferretería".
      Devuelve SOLO un JSON válido con este formato exacto: {"category": "NombreDeCategoria"}
      No incluyas texto antes ni después.

      Producto: ${name}
      Descripción: ${description || 'Sin descripción'}
    `;

    const requestBody = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1 } 
    });

    // PLAN A: Intentamos con la versión más reciente del modelo Flash
    let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody
    });

    // PLAN B: Si Google tira 404 (el error de tu video), pasamos al modelo Pro universal
    if (response.status === 404) {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody
      });
    }

    if (!response.ok) {
      const errData = await response.text();
      throw new Error(`Google API falló: ${errData}`);
    }

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    
    // Limpieza extrema de JSON por si la IA agrega código Markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("La IA no devolvió un JSON.");

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ category: parsed.category });
  } catch (error) {
    console.error("Error en Backend IA Individual:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}