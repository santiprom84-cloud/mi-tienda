import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { items } = await request.json();
    const host = request.headers.get('origin') || 'https://polirubrocba.vercel.app';

    // Formateamos los productos para evitar que Mercado Pago rechace la petición
    const formattedItems = items.map(item => {
      // Si el precio viene como "55.000", le sacamos el punto para que sea 55000 matemático
      const cleanPrice = Number(String(item.price).replace(/\./g, '').replace(',', '.'));
      
      return {
        title: item.name || 'Producto',
        quantity: Number(item.quantity) || 1,
        unit_price: cleanPrice,
        currency_id: 'ARS',
      };
    });

    const preferenceData = {
      items: formattedItems,
      back_urls: {
        success: `${host}/`,
        failure: `${host}/cart`,
        pending: `${host}/`,
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

    // Si Mercado Pago nos rebota, capturamos el motivo exacto
    if (!response.ok) {
      console.error("Rechazado por Mercado Pago:", data);
      return NextResponse.json({ 
        error: "Mercado Pago rechazó el pago", 
        details: data 
      }, { status: response.status });
    }

    return NextResponse.json({ url: data.init_point });
  } catch (error) {
    console.error("Error interno del servidor:", error);
    return NextResponse.json({ error: error.message || "Error desconocido" }, { status: 500 });
  }
}