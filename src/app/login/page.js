'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        // LÓGICA DE INICIAR SESIÓN
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
      } else {
        // LÓGICA DE REGISTRO
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // NUEVO MENSAJE: Le avisamos al cliente que tiene que ir a su mail
        setMessage('✉️ ¡Casi listo! Revisá tu correo (y la carpeta de Spam) para confirmar tu cuenta. Una vez que hagas clic en el link, vas a poder iniciar sesión.');
        
        // Limpiamos el formulario para que quede prolijo
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      // Manejo de errores más inteligente
      if (err.message === 'Invalid login credentials') {
        setError('El correo o la contraseña son incorrectos.');
      } else if (err.message === 'Email not confirmed') {
        setError('Falta confirmar tu cuenta. Por favor, revisá tu bandeja de entrada o la carpeta de Spam.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 md:p-10 rounded-3xl border border-gray-700 shadow-2xl w-full max-w-md relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#FF9980] to-transparent"></div>
        
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">👤</span>
          <h1 className="text-3xl font-black text-gray-100 mb-2">
            {isLogin ? '¡Hola de nuevo!' : 'Crear Cuenta'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isLogin 
              ? 'Ingresá a tu cuenta para ver tus pedidos.' 
              : 'Registrate para guardar tus datos y comprar más rápido.'}
          </p>
        </div>

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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-4 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
          >
            {loading ? 'Procesando...' : (isLogin ? 'Ingresar' : 'Registrarme')}
          </button>

          {error && (
            <div className="bg-red-900/50 text-red-400 border border-red-800 p-4 rounded-xl text-center font-bold text-sm mt-2">
              {error}
            </div>
          )}
          
          {message && (
            <div className="bg-green-900/50 text-green-400 border border-green-800 p-4 rounded-xl text-center font-bold text-sm mt-2">
              {message}
            </div>
          )}
        </form>

        <div className="mt-8 text-center text-gray-400 text-sm">
          {isLogin ? '¿No tenés cuenta? ' : '¿Ya tenés cuenta? '}
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }}
            className="text-[#FF9980] font-bold hover:underline"
          >
            {isLogin ? 'Registrate acá' : 'Iniciá sesión'}
          </button>
        </div>

      </div>
    </div>
  );
}