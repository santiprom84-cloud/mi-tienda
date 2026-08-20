'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
  const { user, loadingAuth } = useAuth();
  const router = useRouter();
  
  // Estados de datos
  const [orders, setOrders] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pedidos'); // 'pedidos', 'usuarios', 'radar'

  const ADMIN_EMAIL = 'santiprom84@gmail.com';

  useEffect(() => {
    if (!loadingAuth) {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/');
      } else {
        fetchAdminData();
        setupPresenceRadar();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadingAuth, router]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Buscamos los pedidos usando la función RPC segura
      const { data: pedidosData, error: pedidosError } = await supabase.rpc('get_admin_pedidos');
      if (pedidosError) throw pedidosError;
      setOrders(pedidosData || []);

      // 2. Buscamos a los usuarios usando la función RPC segura
      const { data: usuariosData, error: usuariosError } = await supabase.rpc('get_admin_users');
      if (usuariosError) throw usuariosError;
      setRegisteredUsers(usuariosData || []);
      
    } catch (error) {
      console.error("Error cargando panel:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para escuchar quién está online en tiempo real
  const setupPresenceRadar = () => {
    const channel = supabase.channel('online-users');
    
    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      const currentlyOnline = [];
      
      // Convertimos el objeto de presencia en un array fácil de leer
      for (const id in presenceState) {
        currentlyOnline.push(presenceState[id][0]);
      }
      setActiveUsers(currentlyOnline);
    }).subscribe();

    return () => supabase.removeChannel(channel);
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase.from('pedidos').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setOrders(orders.map(order => order.id === id ? { ...order, status: newStatus } : order));
    } catch (error) {
      alert(`Error al actualizar: ${error.message}`);
    }
  };

  const deleteOrder = async (id) => {
    const isConfirmed = window.confirm("¿Estás seguro de que querés RECHAZAR y BORRAR este pedido?");
    if (!isConfirmed) return;
    try {
      const { error } = await supabase.from('pedidos').delete().eq('id', id);
      if (error) throw error;
      setOrders(orders.filter(order => order.id !== id));
    } catch (error) {
      alert(`Error al borrar: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-AR', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loadingAuth || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF9980]"></div>
        <p className="text-[#FF9980] font-bold mt-4 animate-pulse">Cargando base de datos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 mt-4 mb-20">
      
      {/* CABECERA Y ESTADÍSTICAS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 border-b border-gray-700 pb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-100 flex items-center gap-3 mb-2">
            <span>⚙️</span> Panel de Control
          </h1>
          <p className="text-gray-400">Control total sobre ventas, clientes y métricas en vivo.</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="bg-gray-800 border border-gray-700 px-6 py-4 rounded-xl flex-1 text-center shadow-lg">
            <span className="block text-xs text-gray-400 font-bold uppercase mb-1">Pedidos</span>
            <span className="text-2xl font-black text-white">{orders.length}</span>
          </div>
          <div className="bg-gray-800 border border-gray-700 px-6 py-4 rounded-xl flex-1 text-center shadow-lg">
            <span className="block text-xs text-gray-400 font-bold uppercase mb-1">Usuarios</span>
            <span className="text-2xl font-black text-white">{registeredUsers.length}</span>
          </div>
          <div className="bg-[#FF9980]/10 border border-[#FF9980]/30 px-6 py-4 rounded-xl flex-1 text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-2 m-3 rounded-full bg-green-500 animate-ping"></div>
            <span className="block text-xs text-[#FF9980] font-bold uppercase mb-1">En Vivo</span>
            <span className="text-2xl font-black text-white">{activeUsers.length}</span>
          </div>
        </div>
      </div>

      {/* MENÚ DE NAVEGACIÓN (PESTAÑAS) */}
      <div className="flex overflow-x-auto gap-2 mb-8 bg-gray-900 p-2 rounded-xl border border-gray-700">
        <button onClick={() => setActiveTab('pedidos')} className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'pedidos' ? 'bg-[#FF9980] text-gray-900 shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
          🛍️ Gestión de Pedidos
        </button>
        <button onClick={() => setActiveTab('usuarios')} className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'usuarios' ? 'bg-[#FF9980] text-gray-900 shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
          👥 Usuarios Registrados
        </button>
        <button onClick={() => setActiveTab('radar')} className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'radar' ? 'bg-[#FF9980] text-gray-900 shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
          📡 Radar en Vivo <span className="bg-green-500 w-2 h-2 rounded-full"></span>
        </button>
      </div>

      {/* CONTENIDO PESTAÑA: PEDIDOS */}
      {activeTab === 'pedidos' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No hay pedidos registrados.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {orders.map(order => (
                <div key={order.id} className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden flex flex-col">
                  
                  {/* Encabezado del pedido */}
                  <div className="bg-gray-900 p-5 border-b border-gray-700 flex justify-between items-start">
                    <div>
                      <p className="text-[#FF9980] text-sm font-black mb-1">ORDEN: #{order.id.split('-')[0].toUpperCase()}</p>
                      <p className="text-gray-400 text-xs">{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                      {order.status === 'pendiente' && <span className="bg-yellow-900/50 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-yellow-800/50">Pendiente</span>}
                      {order.status === 'pagado' && <span className="bg-green-900/50 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-green-800/50">Pagado</span>}
                      {order.status === 'enviado' && <span className="bg-blue-900/50 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-blue-800/50">Enviado</span>}
                    </div>
                  </div>

                  {/* Datos del Cliente */}
                  <div className="p-5 border-b border-gray-700 bg-gray-800/50">
                    <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"><span>👤</span> Datos del comprador</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-gray-500 text-xs">Email</p><p className="font-bold text-gray-200 truncate">{order.user_email || 'Sin registro'}</p></div>
                      <div><p className="text-gray-500 text-xs">Nombre</p><p className="font-bold text-gray-200 truncate">{order.user_name || 'No cargado'}</p></div>
                      <div className="col-span-2"><p className="text-gray-500 text-xs">Teléfono / WhatsApp</p><p className="font-bold text-gray-200">{order.user_phone || 'No cargado'}</p></div>
                    </div>
                  </div>

                  {/* Productos */}
                  <div className="p-5 flex-grow">
                    <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Productos:</h4>
                    <ul className="space-y-3">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-3">
                            <span className="bg-gray-700 text-white font-bold px-2 py-0.5 rounded text-xs">{item.quantity}x</span>
                            <span className="text-gray-200 line-clamp-1">{item.name}</span>
                          </div>
                          <span className="text-gray-400 font-mono">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Acciones */}
                  <div className="bg-gray-900/80 p-5 border-t border-gray-700">
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-gray-400 font-bold">Total a cobrar:</span>
                      <span className="text-2xl font-black text-[#FF9980]">${Number(order.total).toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => updateOrderStatus(order.id, 'pagado')} disabled={order.status === 'pagado'} className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-bold py-3 rounded-lg transition-colors">Marcar Pagado</button>
                      <button onClick={() => updateOrderStatus(order.id, 'enviado')} disabled={order.status === 'enviado'} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-bold py-3 rounded-lg transition-colors">Marcar Enviado</button>
                      <button onClick={() => deleteOrder(order.id)} className="w-full mt-1 border border-red-900/50 text-red-400 hover:bg-red-900/20 text-xs font-bold py-3 rounded-lg transition-colors flex justify-center gap-2">Rechazar y Borrar Pedido</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO PESTAÑA: USUARIOS REGISTRADOS */}
      {activeTab === 'usuarios' && (
        <div className="bg-gray-800 rounded-3xl border border-gray-700 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-900 text-xs uppercase text-gray-500 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 font-black">Email</th>
                  <th className="px-6 py-4 font-black">Nombre (Perfil)</th>
                  <th className="px-6 py-4 font-black">Ciudad</th>
                  <th className="px-6 py-4 font-black">Fecha de Registro</th>
                </tr>
              </thead>
              <tbody>
                {registeredUsers.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-10 text-gray-500">Ningún usuario registrado.</td></tr>
                ) : (
                  registeredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-100">{u.email}</td>
                      <td className="px-6 py-4">{u.full_name || <span className="text-gray-600 italic">No cargado</span>}</td>
                      <td className="px-6 py-4">{u.city || '-'}</td>
                      <td className="px-6 py-4 font-mono text-xs">{formatDate(u.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENIDO PESTAÑA: RADAR EN VIVO */}
      {activeTab === 'radar' && (
        <div className="max-w-2xl mx-auto text-center py-10">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
            <div className="bg-gray-900 p-6 rounded-full border-4 border-green-500/30 relative shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <span className="text-6xl">📡</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-white mb-2">Monitor de Actividad</h2>
          <p className="text-gray-400 mb-10">Visualizando clientes conectados a la tienda en este momento exacto.</p>

          {activeUsers.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl">
              <p className="text-gray-500 font-bold">Nadie está navegando en la tienda ahora mismo.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeUsers.map((activeUser, index) => (
                <div key={index} className="bg-gray-800 border border-green-500/30 p-4 rounded-xl flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                    <span className="font-bold text-gray-200">{activeUser.email}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    Activo desde: {new Date(activeUser.online_at).toLocaleTimeString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}