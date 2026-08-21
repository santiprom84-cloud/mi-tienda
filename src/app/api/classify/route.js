import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { lote } = body; 

    if (!lote || lote.length === 0) {
      return NextResponse.json({ error: "Lote vacío" }, { status: 400 });
    }

    const prompt = `
      Eres un experto en e-commerce. Analiza estos productos y asígnales una categoría principal.
      Usa estas sugerencias base: Tecnología y Gaming, Bazar y Parrilla, Deportes y Tiempo Libre, Librería y Estudio, Accesorios y Telefonía.
      REGLA VITAL: Si el producto no encaja, DEBES CREAR una nueva categoría corta (Ej: Juguetería, Niños, Ferretería).
      Devuelve SOLO un JSON válido con la clave 'productos':
      { "productos": [{"id": "id_del_producto", "category": "Categoria"}] }
      
      Productos:
      ${JSON.stringify(lote.map(p => ({id: p.id, name: p.name, description: p.description})))}
    `;

    // Conexión segura desde el backend usando la llave protegida
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", 
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errData = await response.text();
      throw new Error(`Groq API Status ${response.status}: ${errData}`);
    }

    const result = await response.json();
    const text = result.choices[0].message.content;
    const parsedData = JSON.parse(text);

    // Devolvemos las clasificaciones limpias al frontend
    return NextResponse.json({ clasificaciones: parsedData.productos });
  } catch (error) {
    console.error("Error en Backend IA:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}