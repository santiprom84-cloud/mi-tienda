import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function POST(request) {
  try {
    const body = await request.json();
    const { items } = body;

    // Inicializamos el cliente con la variable de entorno que ya tenías configurada en Vercel
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MP_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MP_ACCESS_TOKEN 
    });

    const preferenceItems = items.map(item => {
      const cleanPrice = Number(String(item.price).replace(/\./g, '').replace(',', '.'));
      return {
        id: item.id || 'item-id',
        title: item.name,
        quantity: Number(item.quantity || 1),
        unit_price: cleanPrice,
        currency_id: 'ARS',
      };
    });

    // Detectamos automáticamente la URL de tu página (sea localhost para pruebas o vercel en producción)
    const baseUrl = request.headers.get('origin') || 'https://polirubrocba.vercel.app';

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: preferenceItems,
        // ACÁ ESTÁ LA MAGIA: Las URLs de retorno
        back_urls: {
          success: `${baseUrl}/gracias`,
          failure: `${baseUrl}/`,
          pending: `${baseUrl}/gracias`,
        },
        auto_return: 'approved', // Redirige solo automáticamente si el pago se aprueba en el acto
      }
    });

    return NextResponse.json({ url: result.init_point });
  } catch (error) {
    console.error('Error al crear preferencia de Mercado Pago:', error);
    return NextResponse.json({ error: 'Error interno al conectar con Mercado Pago' }, { status: 500 });
  }
}