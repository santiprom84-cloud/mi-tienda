import { NextResponse } from 'next/server';

export function proxy(request) {
  const path = request.nextUrl.pathname;

  // --- PROTECCION ADMIN ---
  // Protegemos /admin y /admin-secreto con la cookie de sesion de administrador
  if (path.startsWith('/admin') || path.startsWith('/admin-secreto')) {
    const token = request.cookies.get('admin_token')?.value;
    if (token !== 'autorizado') {
      return NextResponse.redirect(new URL('/login-admin', request.url));
    }
  }

  // --- PROTECCION PERFIL ---
  // Protegemos /perfil server-side para evitar el flash de pantalla en el cliente.
  // Supabase guarda la sesion en una cookie con el prefijo "sb-" y sufijo "auth-token".
  if (path.startsWith('/perfil')) {
    const cookies = request.cookies.getAll();
    const hasSupabaseSession = cookies.some(
      (cookie) => cookie.name.startsWith('sb-') && cookie.name.endsWith('auth-token')
    );

    if (!hasSupabaseSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Le decimos a Next.js exactamente que rutas vigilar para no gastar recursos
export const config = {
  matcher: ['/admin/:path*', '/admin-secreto/:path*', '/perfil'],
};
