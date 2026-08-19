'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function PerfilPage() {
  const { user, loadingAuth, logout } = useAuth();
  const router = useRouter();

  // Estados del formulario
  const [profile, setProfile] = useState({
    full_name: '',
    dni: '',
    phone: '',
    address: '',
    city: '',
    postal_code: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Redirigir si no está logueado y cargar datos si lo está
  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push('/login');
    } else if (user) {
      fetchProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadingAuth, router]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 significa "no se encontró la fila", lo cual es normal si es un usuario nuevo
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          dni: data.dni || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          postal_code: data.postal_code || ''
        });
      }
    } catch (err) {
      console.error('Error cargando perfil:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const updates = {
        id: user.id,
        ...profile,
        updated_at: new Date()
      };

      // Upsert: Si el perfil existe lo actualiza, si no existe lo crea.
      const { error } = await supabase
        .from('perfiles')
        .upsert(updates, { returning: 'minimal' });

      if (error) throw error;
      setMessage('✅ Datos guardados con éxito. ¡Ya estás listo para comprar!');
    } catch (err) {
      setError(`Error al guardar: ${err.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000); // Borra el mensaje de éxito a los 4 segundos
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loadingAuth || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF9980]"></div>
        <p className="text-[#FF9980] font-bold mt-4 animate-pulse">Cargando tu perfil...</p>
      </div>
    );
  }

  // Si por algún motivo no hay usuario, no mostramos nada (el useEffect lo va a redirigir)
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 mt-4 mb-20">
      
      {/* Cabecera del Perfil */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-700 shadow-xl gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="bg-gray-900 p-4 rounded-full border-2 border-[#FF9980] shadow-inner">
            <span className="text-4xl">👤</span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-100">Mi Perfil</h1>
            <p className="text-gray-400 text-sm font-mono mt-1">{user.email}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="bg-gray-900 hover:bg-red-900/40 text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500/50 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md w-full sm:w-auto justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Cerrar Sesión
        </button>
      </div>

      {/* Formulario de Datos */}
      <div className="bg-gray-800 p-6 sm:p-10 rounded-3xl border border-gray-700 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FF9980]/20 via-[#FF9980] to-[#FF9980]/20"></div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span>📦</span> Datos de Envío y Facturación
          </h2>
          <p className="text-gray-400 mt-2">
            Completá estos datos una sola vez para que tus futuras compras en Polirubro Online sean mucho más rápidas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nombre Completo */}
            <div>
              <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Nombre y Apellido</label>
              <input
                type="text" required
                value={profile.full_name}
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            {/* DNI */}
            <div>
              <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">DNI / CUIL</label>
              <input
                type="text" required
                value={profile.dni}
                onChange={(e) => setProfile({...profile, dni: e.target.value})}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors"
                placeholder="Sin puntos ni espacios"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Teléfono de Contacto</label>
              <input
                type="tel" required
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors"
                placeholder="Ej: 351 1234567"
              />
            </div>

            {/* Código Postal */}
            <div>
              <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Código Postal</label>
              <input
                type="text" required
                value={profile.postal_code}
                onChange={(e) => setProfile({...profile, postal_code: e.target.value})}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors"
                placeholder="Ej: 5000"
              />
            </div>

            {/* Dirección (Ocupa las dos columnas) */}
            <div className="md:col-span-2">
              <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Dirección de Entrega (Calle, Número, Depto)</label>
              <input
                type="text" required
                value={profile.address}
                onChange={(e) => setProfile({...profile, address: e.target.value})}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors"
                placeholder="Ej: Av. Colón 1234, Piso 2, Depto B"
              />
            </div>

            {/* Ciudad (Ocupa las dos columnas) */}
            <div className="md:col-span-2">
              <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Ciudad / Barrio</label>
              <input
                type="text" required
                value={profile.city}
                onChange={(e) => setProfile({...profile, city: e.target.value})}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors"
                placeholder="Ej: Córdoba Capital - Barrio Nueva Córdoba"
              />
            </div>

          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-10 bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-4 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
            >
              {saving ? 'Guardando...' : 'Guardar Mis Datos'}
            </button>
          </div>

          {error && (
            <div className="bg-red-900/50 text-red-400 border border-red-800 p-4 rounded-xl font-bold text-sm">
              {error}
            </div>
          )}
          
          {message && (
            <div className="bg-green-900/50 text-green-400 border border-green-800 p-4 rounded-xl font-bold text-sm">
              {message}
            </div>
          )}
        </form>
      </div>

    </div>
  );
}