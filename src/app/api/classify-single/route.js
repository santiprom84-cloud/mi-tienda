import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "El nombre del producto es obligatorio." }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Falta la variable GROQ_API_KEY en Vercel." }, { status: 500 });
    }

    const prompt = `
      Eres un experto en e-commerce. Asigna UNA categoría corta a este producto.
      Sugerencias: "Tecnología y Gaming", "Bazar y Hogar", "Deportes y Tiempo Libre", "Librería y Estudio", "Accesorios", "Indumentaria", "Juguetería", "Ferretería".
      Devuelve SOLO un JSON con este formato exacto: {"category": "NombreDeCategoria"}
      
      Producto: ${name}
      Descripción: ${description || 'Sin descripción'}
    `;

    // Conexión súper rápida a Groq para un solo producto
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", 
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }, // Groq fuerza el JSON perfecto
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errData = await response.text();
      throw new Error(`Groq API rechazó la conexión: Status ${response.status}. Detalle: ${errData}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    const parsed = JSON.parse(text);

    return NextResponse.json({ category: parsed.category });
  } catch (error) {
    console.error("Error en Backend IA Individual (Groq):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}