import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Buscamos la contraseña secreta en tus variables de entorno. 
    // Si por algún motivo falla, la de emergencia será "Polirubro2026"
    const validPassword = process.env.ADMIN_PASSWORD || 'Polirubro2026';

    if (password === validPassword) {
      const response = NextResponse.json({ success: true });
      
      // Creamos una cookie segura que dura 7 días
      response.cookies.set('admin_token', 'autorizado', {
        httpOnly: true, // Evita que hackers lean la cookie con JavaScript
        secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
        maxAge: 60 * 60 * 24 * 7, // 7 días en segundos
        path: '/',
      });
      
      return response;
    }

    // Si le pifias a la clave
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}