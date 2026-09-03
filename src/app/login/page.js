'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const MODE_LOGIN  = 'login';
const MODE_SIGNUP = 'signup';
const MODE_FORGOT = 'forgot';

export default function LoginPage() {
  const [mode, setMode] = useState(MODE_LOGIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  const resetForm = (newMode) => {
    setMode(newMode);
    setEmail('');
    setPassword('');
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === MODE_LOGIN) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message === 'Invalid login credentials') {
            toast.error('El correo o la contraseña son incorrectos.');
          } else if (error.message === 'Email not confirmed') {
            toast.warning('Falta confirmar tu cuenta. Revisá tu bandeja de entrada o la carpeta de Spam.');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('¡Sesión iniciada! Bienvenido de nuevo.');

      } else if (mode === MODE_SIGNUP) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) { toast.error(error.message); return; }
        setMessage('¡Casi listo! Revisá tu bandeja de entrada (y la carpeta de Spam) y hacé clic en el botón para activar tu cuenta.');
        setEmail('');
        setPassword('');

      } else if (mode === MODE_FORGOT) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/perfil`,
        });
        if (error) { toast.error(error.message); return; }
        setMessage('¡Listo! Te enviamos un correo para restablecer tu contraseña. Revisá tu bandeja de entrada.');
        setEmail('');
      }
    } catch (err) {
      toast.error(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const config = {
    [MODE_LOGIN]:  { icon: '👤', title: '¡Hola de nuevo!',    sub: 'Ingresá a tu cuenta para ver tus pedidos.' },
    [MODE_SIGNUP]: { icon: '✨', title: 'Crear Cuenta',        sub: 'Registrate para guardar tus datos y comprar más rápido.' },
    [MODE_FORGOT]: { icon: '🔑', title: 'Recuperar Acceso',   sub: 'Te enviaremos un correo para restablecer tu contraseña.' },
  };
  const { icon, title, sub } = config[mode];

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 md:p-10 rounded-3xl border border-gray-700 shadow-2xl w-full max-w-md relative overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#FF9980] to-transparent" />

        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">{icon}</span>
          <h1 className="text-3xl font-black text-gray-100 mb-2">{title}</h1>
          <p className="text-gray-400 text-sm">{sub}</p>
        </div>

        {message ? (
          <div className="bg-green-900/50 text-green-400 border border-green-800 p-4 rounded-xl text-center font-bold text-sm mb-6">
            ✉️ {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            {mode !== MODE_FORGOT && (
              <div>
                <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Contraseña</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors"
                  placeholder="Mínimo 6 caracteres"
                />
                {mode === MODE_LOGIN && (
                  <button
                    type="button"
                    onClick={() => resetForm(MODE_FORGOT)}
                    className="mt-2 text-xs text-gray-500 hover:text-[#FF9980] transition-colors float-right"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-4 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
            >
              {loading
                ? 'Procesando...'
                : mode === MODE_LOGIN  ? 'Ingresar'
                : mode === MODE_SIGNUP ? 'Registrarme'
                : 'Enviar correo de recuperación'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-gray-400 text-sm flex flex-col gap-2">
          {mode === MODE_LOGIN && (
            <span>
              ¿No tenés cuenta?{' '}
              <button type="button" onClick={() => resetForm(MODE_SIGNUP)} className="text-[#FF9980] font-bold hover:underline">
                Registrate acá
              </button>
            </span>
          )}
          {mode === MODE_SIGNUP && (
            <span>
              ¿Ya tenés cuenta?{' '}
              <button type="button" onClick={() => resetForm(MODE_LOGIN)} className="text-[#FF9980] font-bold hover:underline">
                Iniciá sesión
              </button>
            </span>
          )}
          {(mode === MODE_FORGOT || message) && (
            <button type="button" onClick={() => resetForm(MODE_LOGIN)} className="text-[#FF9980] font-bold hover:underline">
              ← Volver al inicio de sesión
            </button>
          )}
        </div>

      </div>
    </div>
  );
}