import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Nombre del producto requerido" }, { status: 400 });
    }

    const prompt = `
      Eres un experto en e-commerce. Te daré el nombre y la descripción de UN solo producto nuevo.
      Tu tarea es asignarle UNA categoría principal corta y precisa. 
      Sugerencias: "Tecnología y Gaming", "Bazar y Parrilla", "Deportes y Tiempo Libre", "Librería y Estudio", "Accesorios y Telefonía".
      Si no encaja en ninguna, inventa una categoría corta y lógica (Ej: "Indumentaria", "Juguetería", "Herramientas").
      
      RESPONDE ÚNICAMENTE CON EL NOMBRE DE LA CATEGORÍA. Sin comillas, sin formato JSON, sin explicaciones. Solo el texto limpio.
      
      Nombre del producto: ${name}
      Descripción: ${description || 'Sin descripción detallada'}
    `;

    // Consulta rápida a Groq (Asegurate de que GROQ_API_KEY sigue configurada en Vercel)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", 
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1, // Temperatura baja para que no sea muy creativo y responda directo
        max_tokens: 20
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API falló: ${response.status}`);
    }

    const result = await response.json();
    
    // Limpiamos la respuesta para asegurar que no haya saltos de línea ni comillas
    const categoriaLimpia = result.choices[0].message.content.trim().replace(/["']/g, '');

    return NextResponse.json({ category: categoriaLimpia });
  } catch (error) {
    console.error("Error en Auto-Clasificación Única:", error);
    // Si falla por algún motivo, devuelve "Sin Clasificar" para no frenar tu guardado
    return NextResponse.json({ category: "Sin Clasificar" }, { status: 500 });
  }
}