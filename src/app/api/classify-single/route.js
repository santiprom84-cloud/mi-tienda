import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }

    const prompt = `
      Eres un experto en e-commerce. Asigna UNA sola categoría corta y precisa a este producto.
      Sugerencias: "Tecnología y Gaming", "Bazar y Parrilla", "Deportes y Tiempo Libre", "Librería y Estudio", "Accesorios y Telefonía", "Juguetería", "Niños", "Indumentaria".
      Si no encaja en ninguna, inventa una categoría corta y lógica.
      RESPONDE ÚNICAMENTE CON EL NOMBRE DE LA CATEGORÍA. Sin comillas, sin formato, sin explicaciones.
      
      Producto: ${name}
      Descripción: ${description || 'Sin descripción'}
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 } // Súper directo, sin creatividad extra
      })
    });

    if (!response.ok) {
      throw new Error(`Error de Google API: ${response.status}`);
    }

    const data = await response.json();
    // Limpiamos la respuesta para asegurar que sea solo texto limpio
    const category = data.candidates[0].content.parts[0].text.trim().replace(/["']/g, '');

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error auto-clasificando en servidor:", error);
    return NextResponse.json({ category: "Sin Clasificar" }, { status: 500 });
  }
}