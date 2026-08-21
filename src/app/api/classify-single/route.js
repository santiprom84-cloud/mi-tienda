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
      Devuelve SOLO un JSON con este formato exacto: {"category": "NombreDeCategoria"}
      
      Producto: ${name}
      Descripción: ${description || 'Sin descripción'}
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0.1,
          response_mime_type: "application/json" // Obligamos a que devuelva JSON puro
        }
      })
    });

    if (!response.ok) {
      const errData = await response.text();
      throw new Error(`Google API rechazó la conexión: Status ${response.status}. Detalle: ${errData}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(text);

    return NextResponse.json({ category: parsed.category });
  } catch (error) {
    console.error("Error en Backend IA Individual:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}