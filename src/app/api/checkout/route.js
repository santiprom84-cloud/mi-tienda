import { NextResponse } from 'next/server';
import MercadoPagoConfig, { Preference } from 'mercadopago';

// Configuración compatible con la SDK oficial
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN 
});

export async function POST(request) {
  try {
    const { items } = await request.json();
    const host = request.headers.get('origin') || 'http://localhost:3000';

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
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
      },
    });

    return NextResponse.json({ url: result.init_point });
  } catch (error) {
    console.error("Error detallado de Mercado Pago:", error);
    return NextResponse.json({ error: error.message || "Error desconocido" }, { status: 500 });
  }
}