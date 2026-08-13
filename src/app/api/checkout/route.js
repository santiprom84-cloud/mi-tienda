import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { items } = await request.json();
    const host = request.headers.get('origin') || 'http://localhost:3000';

    const preferenceData = {
      items: items.map(item => ({
        title: item.name,
        quantity: Number(item.quantity),
        unit_price: Number(item.price),
        currency_id: 'ARS',
      })),
      back_urls: {
        success: `${host}`,
        failure: `${host}`,
        pending: `${host}`,
      },
      auto_return: 'approved',
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preferenceData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error de la API de Mercado Pago:", data);
      return NextResponse.json({ error: data.message || "Error al conectar con Mercado Pago" }, { status: 500 });
    }

    return NextResponse.json({ url: data.init_point });
  } catch (error) {
    console.error("Error interno en el servidor:", error);
    return NextResponse.json({ error: error.message || "Error desconocido" }, { status: 500 });
  }
}