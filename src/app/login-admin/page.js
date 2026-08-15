'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginAdminPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Si la clave es correcta, te redirigimos a tu panel
        router.push('/admin-secreto');
        router.refresh(); // Refrescamos para que el middleware lea la nueva cookie
      } else {
        const data = await response.json();
        setError(data.error || 'Contraseña incorrecta');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 md:p-12 rounded-3xl border border-gray-700 shadow-2xl w-full max-w-md text-center relative overflow-hidden">
        
        {/* Decoración visual */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#FF9980] to-transparent"></div>
        
        <span className="text-6xl block mb-6 animate-pulse">🔒</span>
        <h1 className="text-3xl font-black text-gray-100 mb-2">Acceso Restringido</h1>
        <p className="text-gray-400 mb-8">Ingresá tu contraseña de administrador para continuar.</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div>
            <input
              type="password"
              placeholder="Contraseña secreta..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-center text-xl text-gray-100 focus:outline-none focus:border-[#FF9980] tracking-widest"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-4 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Entrar al Panel'}
          </button>

          {error && (
            <div className="bg-red-900/50 text-red-400 border border-red-800 p-3 rounded-xl font-bold text-sm">
              {error}
            </div>
          )}
        </form>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <Link href="/" className="text-gray-500 hover:text-[#FF9980] transition-colors text-sm font-bold">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}