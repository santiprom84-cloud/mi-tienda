import { NextResponse } from 'next/server';

// Categorías válidas de la tienda — deben coincidir con CATEGORIAS_BASE en admin/page.js
const CATEGORIAS_VALIDAS = [
  "Tecnología y Gaming",
  "Bazar y Hogar",
  "Deportes y Tiempo Libre",
  "Librería y Estudio",
  "Accesorios y Telefonía",
  "Indumentaria",
  "Juguetería",
  "Ferretería",
];

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, imageUrl } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Se requiere al menos el nombre del producto' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { category: 'Sin Clasificar', error: 'GEMINI_API_KEY no configurada' },
        { status: 200 }
      );
    }

    // Prompt optimizado para clasificación consistente
    const promptText = `Eres un experto en clasificación de productos para una tienda minorista argentina.

Tu tarea es asignar UNA SOLA categoría al siguiente producto, eligiendo entre las opciones disponibles.

CATEGORÍAS DISPONIBLES (elige exactamente una, con ese texto exacto):
${CATEGORIAS_VALIDAS.map((c) => `- "${c}"`).join('\n')}

PRODUCTO A CLASIFICAR:
- Nombre: ${name}${description ? `\n- Descripción: ${description}` : ''}${imageUrl ? `\n- Imagen del producto: ${imageUrl}` : ''}

REGLA: Responde ÚNICAMENTE con un JSON válido así: {"category": "Nombre Exacto De La Categoría"}
No incluyas texto adicional, explicaciones ni markdown.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
            thinkingConfig: {
              thinkingBudget: 512, // Limita el thinking para clasificación simple
            },
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errData = await geminiResponse.json().catch(() => ({}));
      console.error('Error de Gemini API:', errData);
      return NextResponse.json({ category: 'Sin Clasificar' }, { status: 200 });
    }

    const geminiData = await geminiResponse.json();
    // Gemini 3.6 Flash puede incluir thoughtSignature — tomamos el part con texto
    const responseParts = geminiData?.candidates?.[0]?.content?.parts || [];
    const rawText = responseParts.find((p) => p.text)?.text || '';

    let category = 'Sin Clasificar';
    try {
      // Regex más robusto: extrae el valor de "category" aunque haya texto alrededor
      const jsonMatch = rawText.match(/"category"\s*:\s*"([^"]+)"/);
      if (jsonMatch) {
        const potentialCategory = jsonMatch[1].trim();
        if (CATEGORIAS_VALIDAS.includes(potentialCategory)) {
          category = potentialCategory;
        } else {
          // Búsqueda fuzzy si la IA varió ligeramente el texto
          const normalized = potentialCategory.toLowerCase();
          const match = CATEGORIAS_VALIDAS.find(
            (c) =>
              c.toLowerCase() === normalized ||
              c.toLowerCase().includes(normalized.split(' ')[0]) ||
              normalized.includes(c.toLowerCase().split(' ')[0])
          );
          category = match || 'Sin Clasificar';
        }
      }
    } catch {
      console.error('Error parseando respuesta de Gemini:', rawText);
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error interno en /api/categorizar-producto:', error);
    return NextResponse.json({ category: 'Sin Clasificar' }, { status: 200 });
  }
}
