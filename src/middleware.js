import { NextResponse } from 'next/server';

export function middleware(request) {
  // Obtenemos la ruta a la que el usuario quiere entrar
  const path = request.nextUrl.pathname;

  // Si la ruta es el panel de admin (o cualquier cosa adentro del panel)
  if (path.startsWith('/admin-secreto')) {
    // Buscamos la cookie de autorización
    const token = request.cookies.get('admin_token')?.value;

    // Si no tiene el token correcto, lo mandamos a la página de login
    if (token !== 'autorizado') {
      return NextResponse.redirect(new URL('/login-admin', request.url));
    }
  }

  // Si todo está bien (o si está navegando en la tienda normal), lo dejamos pasar
  return NextResponse.next();
}

// Acá le decimos a Next.js qué rutas debe vigilar este middleware para no gastar recursos
export const config = {
  matcher: ['/admin-secreto/:path*'],
};