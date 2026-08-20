'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, loadingAuth } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Correo oficial del administrador (¡El tuyo!)
  const ADMIN_EMAIL = 'santiprom84@gmail.com';

  useEffect(() => {
    // Seguridad: Si no está cargando, y no hay usuario, o el correo NO es el tuyo, lo echamos
    if (!loadingAuth) {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/');
      } else {
        fetchOrders();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadingAuth, router]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error cargando pedidos generales:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Actualizamos la vista local para no tener que recargar la página
      setOrders(orders.map(order => order.id === id ? { ...order, status: newStatus } : order));
    } catch (error) {
      alert(`Error al actualizar: ${error.message}`);
    }
  };

  const deleteOrder = async (id) => {
    const isConfirmed = window.confirm("¿Estás seguro de que querés RECHAZAR y BORRAR este pedido? Esta acción no se puede deshacer.");
    if (!isConfirmed) return;

    try {
      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Lo sacamos de la lista visual
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
        <p className="text-[#FF9980] font-bold mt-4 animate-pulse">Cargando panel de control...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 mt-4 mb-20">
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-700 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-100 flex items-center gap-3">
            <span>⚙️</span> Panel de Administración
          </h1>
          <p className="text-gray-400 mt-2">Gestioná los pedidos, cobros y envíos de tu tienda.</p>
        </div>
        <div className="bg-[#FF9980]/10 border border-[#FF9980]/30 px-6 py-3 rounded-xl">
          <span className="block text-xs text-[#FF9980] font-bold uppercase tracking-wider mb-1">Total Pedidos</span>
          <span className="text-3xl font-black text-white">{orders.length}</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-800 rounded-3xl border border-dashed border-gray-700 shadow-xl">
          <span className="text-6xl block mb-4">💤</span>
          <h3 className="text-xl font-bold text-gray-300 mb-2">No hay pedidos registrados</h3>
          <p className="text-gray-500">Cuando los clientes compren, aparecerán aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map(order => (
            <div key={order.id} className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden flex flex-col">
              
              {/* Cabecera de la Tarjeta del Pedido */}
              <div className="bg-gray-900 p-5 border-b border-gray-700 flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-xs font-mono mb-1">ORDEN: {order.id.split('-')[0].toUpperCase()}</p>
                  <p className="text-gray-200 font-bold text-sm">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-gray-500 font-bold uppercase mb-1">Estado actual</span>
                  {order.status === 'pendiente' && <span className="bg-yellow-900/50 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-yellow-800/50">Pendiente</span>}
                  {order.status === 'pagado' && <span className="bg-green-900/50 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-green-800/50">Pagado</span>}
                  {order.status === 'enviado' && <span className="bg-blue-900/50 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-blue-800/50">Enviado</span>}
                </div>
              </div>

              {/* Contenido (Productos) */}
              <div className="p-5 flex-grow">
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Productos comprados:</h4>
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

              {/* Total y Botones de Acción */}
              <div className="bg-gray-900/50 p-5 border-t border-gray-700">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-gray-400 font-bold">Total a cobrar:</span>
                  <span className="text-2xl font-black text-[#FF9980]">${Number(order.total).toLocaleString('es-AR')}</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {/* Botones para cambiar el estado */}
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'pagado')}
                    disabled={order.status === 'pagado'}
                    className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-bold py-2.5 rounded-lg transition-colors"
                  >
                    Marcar Pagado
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'enviado')}
                    disabled={order.status === 'enviado'}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-bold py-2.5 rounded-lg transition-colors"
                  >
                    Marcar Enviado
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'pendiente')}
                    disabled={order.status === 'pendiente'}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-bold py-2.5 rounded-lg transition-colors"
                  >
                    Pendiente
                  </button>
                  
                  {/* Botón Peligroso: Rechazar/Borrar */}
                  <button 
                    onClick={() => deleteOrder(order.id)}
                    className="w-full mt-2 border border-red-900/50 text-red-400 hover:bg-red-900/20 text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    Rechazar y Borrar Pedido
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}