'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function PerfilPage() {
  const { user, loadingAuth, logout } = useAuth();
  const router = useRouter();

  // Estados del Formulario de Perfil
  const [profile, setProfile] = useState({
    full_name: '', dni: '', phone: '', address: '', city: '', postal_code: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Estados del Historial de Pedidos
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push('/login');
    } else if (user) {
      fetchProfile();
      fetchOrders();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadingAuth, router]);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile({
          full_name: data.full_name || '', dni: data.dni || '', phone: data.phone || '',
          address: data.address || '', city: data.city || '', postal_code: data.postal_code || ''
        });
      }
    } catch (err) {
      console.error('Error cargando perfil:', err.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error cargando pedidos:', err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const updates = { id: user.id, ...profile, updated_at: new Date() };
      const { error } = await supabase.from('perfiles').upsert(updates, { returning: 'minimal' });

      if (error) throw error;
      setMessage('✅ Datos guardados con éxito. ¡Ya estás listo para comprar!');
    } catch (err) {
      setError(`Error al guardar: ${err.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Funciones de formato visual para los pedidos
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-AR', options);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pendiente':
        return <span className="bg-yellow-900/50 text-yellow-400 border border-yellow-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Pendiente</span>;
      case 'pagado':
        return <span className="bg-green-900/50 text-green-400 border border-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Pagado / Preparando</span>;
      case 'enviado':
        return <span className="bg-blue-900/50 text-blue-400 border border-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Enviado</span>;
      default:
        return <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  if (loadingAuth || loadingProfile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF9980]"></div>
        <p className="text-[#FF9980] font-bold mt-4 animate-pulse">Cargando tu perfil...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 mt-4 mb-20">
      
      {/* CABECERA GENERAL */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-700 shadow-xl gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="bg-gray-900 p-4 rounded-full border-2 border-[#FF9980] shadow-inner">
            <span className="text-4xl">👤</span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-100">Mi Panel</h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: Formulario de Datos (Ocupa 5/12 en PC) */}
        <div className="lg:col-span-5 h-fit bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-700 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FF9980]/20 via-[#FF9980] to-[#FF9980]/20"></div>
          
          <div className="mb-8 border-b border-gray-700 pb-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>📦</span> Datos de Envío
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Nombre y Apellido</label>
              <input type="text" required value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-sm text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors"/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">DNI / CUIL</label>
                <input type="text" required value={profile.dni} onChange={(e) => setProfile({...profile, dni: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-sm text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors" />
              </div>
              <div>
                <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Teléfono</label>
                <input type="tel" required value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-sm text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Dirección de Entrega</label>
              <input type="text" required value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-sm text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors" placeholder="Calle, Número, Depto"/>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Ciudad / Barrio</label>
                <input type="text" required value={profile.city} onChange={(e) => setProfile({...profile, city: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-sm text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors" />
              </div>
              <div>
                <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">C.P.</label>
                <input type="text" required value={profile.postal_code} onChange={(e) => setProfile({...profile, postal_code: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-sm text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors" />
              </div>
            </div>

            <div className="mt-4">
              <button type="submit" disabled={saving} className="w-full bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-4 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none">
                {saving ? 'Guardando...' : 'Guardar Mis Datos'}
              </button>
            </div>

            {error && <div className="bg-red-900/50 text-red-400 border border-red-800 p-3 rounded-xl font-bold text-sm text-center">{error}</div>}
            {message && <div className="bg-green-900/50 text-green-400 border border-green-800 p-3 rounded-xl font-bold text-sm text-center">{message}</div>}
          </form>
        </div>

        {/* COLUMNA DERECHA: Historial de Pedidos (Ocupa 7/12 en PC) */}
        <div className="lg:col-span-7 bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-700 shadow-xl flex flex-col h-full max-h-[750px]">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-700 pb-4 gap-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>🛍️</span> Historial de Compras
            </h2>
            <span className="bg-gray-900 text-[#FF9980] px-4 py-2 rounded-full text-sm font-bold border border-gray-700 shadow-inner inline-block text-center">
              {orders.length} {orders.length === 1 ? 'pedido registrado' : 'pedidos registrados'}
            </span>
          </div>

          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
            {loadingOrders ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#FF9980]"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-dashed border-gray-700">
                <span className="text-6xl block mb-4 opacity-50">🛒</span>
                <h3 className="text-xl font-bold text-gray-300 mb-2">Aún no tenés pedidos</h3>
                <p className="text-gray-500 text-sm">Cuando realices tu primera compra, aparecerá aquí junto con su estado de envío.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-gray-900 p-5 rounded-2xl border border-gray-700 hover:border-[#FF9980]/50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-xs font-mono mb-1">Orden #{order.id.split('-')[0].toUpperCase()}</p>
                        <p className="text-gray-100 font-bold text-sm">{formatDate(order.created_at)}</p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    <div className="border-t border-gray-800 pt-4 mt-4 flex justify-between items-end">
                      <div className="text-gray-400 text-sm">
                        <span className="font-bold text-gray-200 bg-gray-800 px-2 py-1 rounded-md">{order.items?.length || 0}</span> productos
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Abonado</p>
                        <p className="text-xl font-black text-[#FF9980]">${Number(order.total).toLocaleString('es-AR')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}