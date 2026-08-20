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
  const [adminProducts, setAdminProducts] = useState([]); // NUEVO: Estado para productos
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pedidos'); // 'pedidos', 'usuarios', 'radar', 'productos'

  // NUEVO: Estados para el Formulario de Productos
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', price: '', category: '', image: '', description: ''
  });
  const [savingProduct, setSavingProduct] = useState(false);

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
      // 1. Pedidos
      const { data: pedidosData } = await supabase.rpc('get_admin_pedidos');
      setOrders(pedidosData || []);

      // 2. Usuarios
      const { data: usuariosData } = await supabase.rpc('get_admin_users');
      setRegisteredUsers(usuariosData || []);

      // 3. NUEVO: Productos
      const { data: productosData } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false });
      setAdminProducts(productosData || []);
      
    } catch (error) {
      console.error("Error cargando panel:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupPresenceRadar = () => {
    const channel = supabase.channel('online-users');
    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      const currentlyOnline = [];
      for (const id in presenceState) {
        currentlyOnline.push(presenceState[id][0]);
      }
      setActiveUsers(currentlyOnline);
    }).subscribe();
    return () => supabase.removeChannel(channel);
  };

  // --- FUNCIONES DE PEDIDOS ---
  const updateOrderStatus = async (id, newStatus) => {
    try {
      await supabase.from('pedidos').update({ status: newStatus }).eq('id', id);
      setOrders(orders.map(order => order.id === id ? { ...order, status: newStatus } : order));
    } catch (error) {
      alert(`Error al actualizar: ${error.message}`);
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("¿Rechazar y borrar pedido?")) return;
    try {
      await supabase.from('pedidos').delete().eq('id', id);
      setOrders(orders.filter(order => order.id !== id));
    } catch (error) {
      alert(`Error al borrar: ${error.message}`);
    }
  };

  // --- NUEVAS FUNCIONES DE PRODUCTOS ---
  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || '',
        price: product.price || '',
        category: product.category || '',
        image: product.image || '',
        description: product.description || ''
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', price: '', category: '', image: '', description: '' });
    }
    setIsProductModalOpen(true);
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const productData = {
        name: productForm.name,
        price: Number(productForm.price),
        category: productForm.category,
        image: productForm.image,
        description: productForm.description
      };

      if (editingProduct) {
        // Actualizar
        const { data, error } = await supabase.from('productos').update(productData).eq('id', editingProduct.id).select().single();
        if (error) throw error;
        setAdminProducts(adminProducts.map(p => p.id === editingProduct.id ? data : p));
      } else {
        // Crear nuevo
        const { data, error } = await supabase.from('productos').insert([productData]).select().single();
        if (error) throw error;
        setAdminProducts([data, ...adminProducts]);
      }
      setIsProductModalOpen(false);
    } catch (error) {
      alert(`Error al guardar producto: ${error.message}`);
    } finally {
      setSavingProduct(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("¿Estás seguro de ELIMINAR este producto del catálogo?")) return;
    try {
      const { error } = await supabase.from('productos').delete().eq('id', id);
      if (error) throw error;
      setAdminProducts(adminProducts.filter(p => p.id !== id));
    } catch (error) {
      alert(`Error al eliminar: ${error.message}`);
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
        <p className="text-[#FF9980] font-bold mt-4 animate-pulse">Cargando centro de mando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 mt-4 mb-20 relative">
      
      {/* CABECERA Y ESTADÍSTICAS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 border-b border-gray-700 pb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-100 flex items-center gap-3 mb-2">
            <span>⚙️</span> Panel de Control
          </h1>
          <p className="text-gray-400">Control total sobre ventas, inventario y clientes.</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 custom-scrollbar">
          <div className="bg-gray-800 border border-gray-700 px-6 py-4 rounded-xl flex-1 text-center shadow-lg min-w-[120px]">
            <span className="block text-xs text-gray-400 font-bold uppercase mb-1">Pedidos</span>
            <span className="text-2xl font-black text-white">{orders.length}</span>
          </div>
          <div className="bg-gray-800 border border-gray-700 px-6 py-4 rounded-xl flex-1 text-center shadow-lg min-w-[120px]">
            <span className="block text-xs text-[#FF9980] font-bold uppercase mb-1">Catálogo</span>
            <span className="text-2xl font-black text-white">{adminProducts.length}</span>
          </div>
          <div className="bg-gray-800 border border-gray-700 px-6 py-4 rounded-xl flex-1 text-center shadow-lg min-w-[120px]">
            <span className="block text-xs text-gray-400 font-bold uppercase mb-1">Usuarios</span>
            <span className="text-2xl font-black text-white">{registeredUsers.length}</span>
          </div>
          <div className="bg-[#FF9980]/10 border border-[#FF9980]/30 px-6 py-4 rounded-xl flex-1 text-center shadow-lg relative overflow-hidden min-w-[120px]">
            <div className="absolute top-0 right-0 w-2 h-2 m-3 rounded-full bg-green-500 animate-ping"></div>
            <span className="block text-xs text-[#FF9980] font-bold uppercase mb-1">En Vivo</span>
            <span className="text-2xl font-black text-white">{activeUsers.length}</span>
          </div>
        </div>
      </div>

      {/* MENÚ DE NAVEGACIÓN (PESTAÑAS) */}
      <div className="flex overflow-x-auto gap-2 mb-8 bg-gray-900 p-2 rounded-xl border border-gray-700 custom-scrollbar">
        <button onClick={() => setActiveTab('pedidos')} className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'pedidos' ? 'bg-[#FF9980] text-gray-900 shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
          🛍️ Pedidos
        </button>
        <button onClick={() => setActiveTab('productos')} className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'productos' ? 'bg-[#FF9980] text-gray-900 shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
          📦 Productos
        </button>
        <button onClick={() => setActiveTab('usuarios')} className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'usuarios' ? 'bg-[#FF9980] text-gray-900 shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
          👥 Usuarios
        </button>
        <button onClick={() => setActiveTab('radar')} className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'radar' ? 'bg-[#FF9980] text-gray-900 shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
          📡 En Vivo <span className="bg-green-500 w-2 h-2 rounded-full"></span>
        </button>
      </div>

      {/* ========================================== */}
      {/* PESTAÑA: PRODUCTOS (NUEVA) */}
      {/* ========================================== */}
      {activeTab === 'productos' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Barra superior de productos */}
          <div className="flex justify-between items-center bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
            <div>
              <h2 className="text-xl font-black text-white">Inventario</h2>
              <p className="text-gray-400 text-sm">Gestioná los {adminProducts.length} productos de tu tienda.</p>
            </div>
            <button 
              onClick={() => openProductModal()}
              className="bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black px-6 py-3 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Nuevo Producto
            </button>
          </div>

          {/* Tabla de Productos */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-900 text-xs uppercase text-gray-500 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 font-black">Imagen</th>
                    <th className="px-6 py-4 font-black">Nombre del Producto</th>
                    <th className="px-6 py-4 font-black">Categoría</th>
                    <th className="px-6 py-4 font-black">Precio</th>
                    <th className="px-6 py-4 font-black text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {adminProducts.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-10 text-gray-500">No hay productos en el catálogo.</td></tr>
                  ) : (
                    adminProducts.map((p) => (
                      <tr key={p.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-3">
                          <img src={p.image || 'https://via.placeholder.com/50'} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-gray-600" />
                        </td>
                        <td className="px-6 py-3 font-bold text-gray-100 max-w-[200px] truncate" title={p.name}>{p.name}</td>
                        <td className="px-6 py-3">
                          <span className="bg-gray-900 border border-gray-600 px-2 py-1 rounded-md text-xs">{p.category || '-'}</span>
                        </td>
                        <td className="px-6 py-3 font-black text-[#FF9980]">${Number(p.price).toLocaleString('es-AR')}</td>
                        <td className="px-6 py-3 text-right space-x-2">
                          <button onClick={() => openProductModal(p)} className="bg-blue-900/50 text-blue-400 hover:bg-blue-900 border border-blue-800/50 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors">
                            Editar
                          </button>
                          <button onClick={() => deleteProduct(p.id)} className="bg-red-900/50 text-red-400 hover:bg-red-900 border border-red-800/50 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors">
                            Borrar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: CREAR / EDITAR PRODUCTO */}
      {/* ========================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)}></div>
          <div className="relative bg-gray-800 w-full max-w-2xl rounded-3xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-gray-900 p-6 border-b border-gray-700 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <span>{editingProduct ? '✏️' : '✨'}</span>
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-white bg-gray-800 hover:bg-red-500/20 p-2 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
              <form id="productForm" onSubmit={saveProduct} className="flex flex-col gap-5">
                
                <div>
                  <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Nombre del Producto *</label>
                  <input type="text" required value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors" placeholder="Ej: Termo Stanley 1L" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Precio ($) *</label>
                    <input type="number" required min="0" step="0.01" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors" placeholder="Ej: 15500" />
                  </div>
                  <div>
                    <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Categoría</label>
                    <input type="text" value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors" placeholder="Ej: Bazar" />
                  </div>
                </div>

                <div>
                  <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">URL de la Imagen</label>
                  <input type="url" value={productForm.image} onChange={(e) => setProductForm({...productForm, image: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors" placeholder="https://ejemplo.com/imagen.jpg" />
                  {productForm.image && (
                    <div className="mt-3 bg-gray-900 p-2 rounded-xl inline-block border border-gray-700">
                      <img src={productForm.image} alt="Vista previa" className="h-20 rounded-lg object-cover" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Descripción Detallada</label>
                  <textarea rows="4" value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors resize-none" placeholder="Escribí las características principales..."></textarea>
                </div>

              </form>
            </div>

            <div className="bg-gray-900 p-6 border-t border-gray-700 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                Cancelar
              </button>
              <button type="submit" form="productForm" disabled={savingProduct} className="bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black px-8 py-3 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none flex items-center gap-2">
                {savingProduct ? 'Guardando...' : 'Guardar Producto'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* RESTO DE PESTAÑAS (Las que ya funcionaban) */}
      {/* ========================================== */}
      
      {/* CONTENIDO PESTAÑA: PEDIDOS */}
      {activeTab === 'pedidos' && (
        <div className="space-y-6 animate-fade-in">
          {orders.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No hay pedidos registrados.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {orders.map(order => (
                <div key={order.id} className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden flex flex-col">
                  {/* ... (Encabezado y Datos del pedido idénticos) ... */}
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
                  <div className="p-5 border-b border-gray-700 bg-gray-800/50">
                    <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"><span>👤</span> Datos del comprador</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-gray-500 text-xs">Email</p><p className="font-bold text-gray-200 truncate">{order.user_email || 'Sin registro'}</p></div>
                      <div><p className="text-gray-500 text-xs">Nombre</p><p className="font-bold text-gray-200 truncate">{order.user_name || 'No cargado'}</p></div>
                      <div className="col-span-2"><p className="text-gray-500 text-xs">Teléfono / WhatsApp</p><p className="font-bold text-gray-200">{order.user_phone || 'No cargado'}</p></div>
                    </div>
                  </div>
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
        <div className="bg-gray-800 rounded-3xl border border-gray-700 shadow-xl overflow-hidden animate-fade-in">
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
        <div className="max-w-2xl mx-auto text-center py-10 animate-fade-in">
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

      {/* Animaciones simples */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>

    </div>
  );
}