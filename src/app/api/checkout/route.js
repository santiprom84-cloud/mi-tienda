import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });

export async function POST(request) {
  try {
    const { items } = await request.json();

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: items.map(item => ({
          title: item.name,
          quantity: item.quantity,
          unit_price: Number(item.price),
          currency_id: 'ARS',
        })),
        back_urls: {
          success: 'http://localhost:3000',
          failure: 'http://localhost:3000',
        },
        auto_return: 'approved',
      },
    });

    return NextResponse.json({ url: result.init_point });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}