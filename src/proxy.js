import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function proxy(request) {
  const path = request.nextUrl.pathname;

  // --- PROTECCION ADMIN ---
  if (path.startsWith('/admin') || path.startsWith('/admin-secreto')) {
    const token = request.cookies.get('admin_token')?.value;
    if (token !== 'autorizado') {
      return NextResponse.redirect(new URL('/login-admin', request.url));
    }
  }

  // --- REFRESCO DE SESIÓN SUPABASE + PROTECCIÓN /perfil ---
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Propagar cookies de sesión tanto en la request como en la response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresca el token de sesión en cada request (CRÍTICO para Vercel)
  const { data: { user } } = await supabase.auth.getUser();

  // Protege /perfil: si no hay usuario autenticado, redirigir a /login
  if (path.startsWith('/perfil') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // IMPORTANTE: siempre retornar `response` para que las cookies se propaguen
  return response;
}

// Aplicar a todas las rutas relevantes
export const config = {
  matcher: [
    '/admin/:path*',
    '/admin-secreto/:path*',
    '/perfil/:path*',
    // También incluir rutas generales para refrescar el token
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
