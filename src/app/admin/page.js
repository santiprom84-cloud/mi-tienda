'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
  const { user, loadingAuth } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [adminProducts, setAdminProducts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pedidos'); 
  const [adminProductSearch, setAdminProductSearch] = useState('');

  // Estado para auto-clasificación masiva
  const [isAutoClassifying, setIsAutoClassifying] = useState(false);
  const [autoClassifyProgress, setAutoClassifyProgress] = useState({ done: 0, total: 0 });

  // Estado para sugerencia de IA en el formulario individual
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);
  const [categoryIsAISuggested, setCategoryIsAISuggested] = useState(false);
  const [aiSuggestTimeout, setAiSuggestTimeout] = useState(null);

  // Estado para estadísticas de visitas
  const [visitasHoy, setVisitasHoy] = useState(null);
  const [historialVisitas, setHistorialVisitas] = useState([]);
  const [loadingVisitas, setLoadingVisitas] = useState(false);
  const [isHistorialOpen, setIsHistorialOpen] = useState(false);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // AÑADIDO: Estado 'featured' (destacado) para el formulario
  const [productForm, setProductForm] = useState({
    name: '', price: '', category: '', customCategory: '', image: '', description: '', featured: false
  });
  
  const [savingProduct, setSavingProduct] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const ADMIN_EMAIL = 'santiprom84@gmail.com';

  const CATEGORIAS_BASE = [
    "Tecnología y Gaming",
    "Bazar y Hogar",
    "Deportes y Tiempo Libre",
    "Librería y Estudio",
    "Accesorios y Telefonía",
    "Indumentaria",
    "Juguetería",
    "Ferretería",
    "Otra..." 
  ];

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

  // Carga las estadísticas de visitas automáticamente cuando se abre la pestaña Radar
  useEffect(() => {
    if (activeTab === 'radar' && user?.email === ADMIN_EMAIL) {
      fetchVisitorStats();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const { data: pedidosData } = await supabase.rpc('get_admin_pedidos');
      setOrders(pedidosData || []);

      const { data: usuariosData } = await supabase.rpc('get_admin_users');
      setRegisteredUsers(usuariosData || []);

      const { data: productosData } = await supabase.from('productos').select('*').order('created_at', { ascending: false });
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

  const fetchVisitorStats = async () => {
    setLoadingVisitas(true);
    try {
      const res = await fetch('/api/visitas');
      const data = await res.json();
      if (!data.error) {
        setVisitasHoy(data.visitasHoy);
        setHistorialVisitas(data.historial || []);
      }
    } catch (err) {
      console.error('Error cargando visitas:', err);
    } finally {
      setLoadingVisitas(false);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await supabase.from('pedidos').update({ status: newStatus }).eq('id', id);
      setOrders(orders.map(order => order.id === id ? { ...order, status: newStatus } : order));
    } catch (error) {
      alert(`Error al actualizar: ${error.message}`);
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("⚠️ ¿Estás seguro de eliminar este pedido por completo? Esta acción no se puede deshacer.")) return;
    try {
      await supabase.from('pedidos').delete().eq('id', id);
      setOrders(orders.filter(order => order.id !== id));
    } catch (error) {
      alert(`Error al borrar pedido: ${error.message}`);
    }
  };

  // Sugiere categoría automáticamente al escribir el nombre del producto
  const suggestCategoryWithAI = (name, description, imageUrl) => {
    if (aiSuggestTimeout) clearTimeout(aiSuggestTimeout);
    if (!name || name.trim().length < 4) return;

    const timeout = setTimeout(async () => {
      setIsSuggestingCategory(true);
      try {
        const res = await fetch('/api/categorizar-producto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), description, imageUrl }),
        });
        const data = await res.json();
        if (data.category && data.category !== 'Sin Clasificar') {
          setProductForm(prev => ({ ...prev, category: data.category, customCategory: '' }));
          setCategoryIsAISuggested(true);
        }
      } catch (err) {
        console.error('Error al sugerir categoría:', err);
      } finally {
        setIsSuggestingCategory(false);
      }
    }, 900); // Espera 900ms tras dejar de escribir

    setAiSuggestTimeout(timeout);
  };

  // Auto-clasifica TODOS los productos del inventario de una sola vez
  const autoClassifyAll = async () => {
    const productsToClassify = adminProducts.filter(
      p => !p.category || p.category === 'Sin Clasificar' || p.category === 'Todas'
    );

    if (productsToClassify.length === 0) {
      alert('✅ ¡Todos los productos ya tienen categoría asignada!');
      return;
    }

    const confirmed = window.confirm(
      `🧠 La IA va a clasificar ${productsToClassify.length} producto(s) sin categoría.\n¿Continuamos?`
    );
    if (!confirmed) return;

    setIsAutoClassifying(true);
    setAutoClassifyProgress({ done: 0, total: productsToClassify.length });

    let procesados = 0;
    for (const product of productsToClassify) {
      try {
        const res = await fetch('/api/categorizar-producto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: product.name,
            description: product.description || '',
            imageUrl: product.image || '',
          }),
        });
        const data = await res.json();
        if (data.category && data.category !== 'Sin Clasificar') {
          await supabase
            .from('productos')
            .update({ category: data.category })
            .eq('id', product.id);
          procesados++;
        }
      } catch (err) {
        console.error(`Error clasificando producto ${product.name}:`, err);
      }
      setAutoClassifyProgress(prev => ({ ...prev, done: prev.done + 1 }));
    }

    setIsAutoClassifying(false);
    alert(`✅ ¡Listo! Se clasificaron ${procesados} de ${productsToClassify.length} productos.`);
    fetchAdminData();
  };

  const openProductModal = (product = null) => {
    setCategoryIsAISuggested(false);
    if (product) {
      const isKnownCategory = CATEGORIAS_BASE.includes(product.category);
      setEditingProduct(product);
      setProductForm({
        name: product.name || '', 
        price: product.price || '', 
        category: isKnownCategory ? product.category : 'Otra...', 
        customCategory: isKnownCategory ? '' : (product.category || ''), 
        image: product.image || '', 
        description: product.description || '',
        featured: product.featured || false
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', price: '', category: CATEGORIAS_BASE[0], customCategory: '', image: '', description: '', featured: false });
    }
    setIsProductModalOpen(true);
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setSavingProduct(true);
    
    try {
      let finalCategory = productForm.category === 'Otra...' 
        ? productForm.customCategory.trim() 
        : productForm.category;

      if (!finalCategory) {
        finalCategory = "Sin Clasificar";
      }

      const productData = {
        name: productForm.name,
        price: Number(productForm.price),
        category: finalCategory,
        image: productForm.image,
        description: productForm.description,
        featured: productForm.featured // Guardamos el estado de destacado
      };

      if (editingProduct) {
        const { data, error } = await supabase.from('productos').update(productData).eq('id', editingProduct.id).select().single();
        if (error) throw error;
        setAdminProducts(adminProducts.map(p => p.id === editingProduct.id ? data : p));
      } else {
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

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('productos').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('productos').getPublicUrl(fileName);
      setProductForm(prev => ({ ...prev, image: data.publicUrl }));
    } catch (error) {
      alert(`Error al subir imagen: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };
  const onFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-AR', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredAdminProducts = adminProducts.filter(p => 
    p.name.toLowerCase().includes(adminProductSearch.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(adminProductSearch.toLowerCase()))
  );

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

      <div className="flex overflow-x-auto gap-2 mb-8 bg-gray-900 p-2 rounded-xl border border-gray-700 custom-scrollbar">
        <button onClick={() => setActiveTab('pedidos')} className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'pedidos' ? 'bg-[#FF9980] text-gray-900 shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>🛍️ Pedidos</button>
        <button onClick={() => setActiveTab('productos')} className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'productos' ? 'bg-[#FF9980] text-gray-900 shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>📦 Productos</button>
        <button onClick={() => setActiveTab('usuarios')} className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'usuarios' ? 'bg-[#FF9980] text-gray-900 shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>👥 Usuarios</button>
        <button onClick={() => setActiveTab('radar')} className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'radar' ? 'bg-[#FF9980] text-gray-900 shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>📡 En Vivo <span className="bg-green-500 w-2 h-2 rounded-full"></span></button>
      </div>

      {activeTab === 'productos' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg gap-4">
            <div>
              <h2 className="text-xl font-black text-white">Inventario</h2>
              <p className="text-gray-400 text-sm">Gestioná los {adminProducts.length} productos de tu tienda.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-3">
              
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar en inventario..."
                  value={adminProductSearch}
                  onChange={(e) => setAdminProductSearch(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors shadow-inner"
                />
              </div>

              <button 
                onClick={autoClassifyAll}
                disabled={isAutoClassifying}
                className="w-full sm:w-auto bg-[#FF9980]/20 hover:bg-[#FF9980]/30 text-[#FF9980] border border-[#FF9980]/50 font-black px-4 py-2.5 sm:py-3 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isAutoClassifying ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    {autoClassifyProgress.done}/{autoClassifyProgress.total} clasificando...
                  </>
                ) : (
                  <>🧠 Auto-clasificar sin categoría</>
                )}
              </button>

              <button onClick={() => openProductModal()} className="w-full sm:w-auto bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black px-6 py-2.5 sm:py-3 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Nuevo Producto
              </button>
            </div>
          </div>

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
                  {filteredAdminProducts.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-10 text-gray-500">No se encontraron productos.</td></tr>
                  ) : (
                    filteredAdminProducts.map((p) => (
                      <tr key={p.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-3">
                          <img src={p.image || 'https://via.placeholder.com/50'} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-gray-600" />
                        </td>
                        <td className="px-6 py-3 font-bold text-gray-100 max-w-[200px] truncate" title={p.name}>
                          {p.featured && <span className="text-yellow-500 mr-2" title="Producto Destacado">⭐</span>}
                          {p.name}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`border px-2 py-1 rounded-md text-xs font-bold ${!p.category || p.category === 'Todas' ? 'bg-red-900/50 border-red-800 text-red-400' : 'bg-gray-900 border-gray-600'}`}>
                            {p.category || 'SIN CLASIFICAR'}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-black text-[#FF9980]">${Number(p.price).toLocaleString('es-AR')}</td>
                        <td className="px-6 py-3 text-right space-x-2">
                          <button onClick={() => openProductModal(p)} className="bg-blue-900/50 text-blue-400 hover:bg-blue-900 border border-blue-800/50 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors">Editar</button>
                          <button onClick={() => deleteProduct(p.id)} className="bg-red-900/50 text-red-400 hover:bg-red-900 border border-red-800/50 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors">Borrar</button>
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

      {/* ===================== TAB: PEDIDOS ===================== */}
      {activeTab === 'pedidos' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg gap-3">
            <div>
              <h2 className="text-xl font-black text-white">Gestión de Pedidos</h2>
              <p className="text-gray-400 text-sm">{orders.length} pedidos registrados en total.</p>
            </div>
            <button onClick={fetchAdminData} className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
              Actualizar
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-20 bg-gray-800 rounded-2xl border border-gray-700">
              <span className="text-5xl block mb-4">🛍️</span>
              <p className="text-gray-400 font-bold">No hay pedidos registrados todavía.</p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-gray-900 text-xs uppercase text-gray-500 border-b border-gray-700">
                    <tr>
                      <th className="px-5 py-4 font-black">Orden</th>
                      <th className="px-5 py-4 font-black">Cliente</th>
                      <th className="px-5 py-4 font-black">Fecha</th>
                      <th className="px-5 py-4 font-black">Total</th>
                      <th className="px-5 py-4 font-black">Estado</th>
                      <th className="px-5 py-4 font-black text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs text-[#FF9980] font-bold bg-[#FF9980]/10 px-2 py-1 rounded-md">
                            #{(order.id || '').split('-')[0].toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-bold text-gray-100 truncate max-w-[150px]">{order.user_name || order.nombre_cliente || 'Anónimo'}</p>
                          <p className="text-gray-500 text-xs truncate max-w-[150px]">{order.user_email || order.email || ''}</p>
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(order.created_at)}</td>
                        <td className="px-5 py-3 font-black text-[#FF9980]">${Number(order.total).toLocaleString('es-AR')}</td>
                        <td className="px-5 py-3">
                          <select
                            value={order.status || order.estado || 'pendiente'}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="bg-gray-900 border border-gray-600 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-200 focus:outline-none focus:border-[#FF9980] cursor-pointer"
                          >
                            <option value="pendiente">🟡 Pendiente</option>
                            <option value="pagado">🟢 Pagado</option>
                            <option value="enviado">🔵 Enviado</option>
                            <option value="cancelado">🔴 Cancelado</option>
                          </select>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => deleteOrder(order.id)} className="bg-red-900/50 text-red-400 hover:bg-red-900 border border-red-800/50 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors">
                            Borrar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB: USUARIOS ===================== */}
      {activeTab === 'usuarios' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg gap-3">
            <div>
              <h2 className="text-xl font-black text-white">Usuarios Registrados</h2>
              <p className="text-gray-400 text-sm">{registeredUsers.length} cuentas creadas en la tienda.</p>
            </div>
            <button onClick={fetchAdminData} className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
              Actualizar
            </button>
          </div>

          {registeredUsers.length === 0 ? (
            <div className="text-center py-20 bg-gray-800 rounded-2xl border border-gray-700">
              <span className="text-5xl block mb-4">👥</span>
              <p className="text-gray-400 font-bold">No hay usuarios registrados todavía.</p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-gray-900 text-xs uppercase text-gray-500 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 font-black">Email</th>
                      <th className="px-6 py-4 font-black">Nombre</th>
                      <th className="px-6 py-4 font-black">Registrado</th>
                      <th className="px-6 py-4 font-black">Último acceso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredUsers.map((u, i) => (
                      <tr key={u.id || i} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-3">
                          <span className="font-mono text-gray-100 text-xs">{u.email}</span>
                        </td>
                        <td className="px-6 py-3 text-gray-300 font-bold text-sm">
                          {u.full_name || u.raw_user_meta_data?.full_name || <span className="text-gray-600 italic">Sin nombre</span>}
                        </td>
                        <td className="px-6 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {u.created_at ? formatDate(u.created_at) : '—'}
                        </td>
                        <td className="px-6 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {u.last_sign_in_at ? formatDate(u.last_sign_in_at) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB: RADAR EN VIVO ===================== */}
      {activeTab === 'radar' && (
        <div className="space-y-6 animate-fade-in">

          {/* Header con título y botones */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <div>
                <h2 className="text-xl font-black text-white">Radar en Vivo</h2>
                <p className="text-gray-400 text-sm">Usuarios activos ahora + métricas del día.</p>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={fetchVisitorStats}
                disabled={loadingVisitas}
                className="flex-1 sm:flex-none bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                Actualizar
              </button>
              <button
                onClick={() => { fetchVisitorStats(); setIsHistorialOpen(true); }}
                className="flex-1 sm:flex-none bg-[#FF9980]/20 hover:bg-[#FF9980]/30 text-[#FF9980] border border-[#FF9980]/50 font-black px-4 py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                📅 Historial
              </button>
            </div>
          </div>

          {/* Cards de métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Card: Visitas hoy */}
            <div className="bg-gray-800 border border-[#FF9980]/30 rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF9980]/5 rounded-bl-full"></div>
              <p className="text-xs text-[#FF9980] font-black uppercase tracking-wider mb-1">Visitas hoy</p>
              {loadingVisitas ? (
                <div className="animate-pulse h-10 w-20 bg-gray-700 rounded-lg mt-1"></div>
              ) : (
                <p className="text-5xl font-black text-white leading-none">
                  {visitasHoy ?? '—'}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-2">Dispositivos únicos</p>
              {/* Variación vs ayer */}
              {!loadingVisitas && historialVisitas.length >= 2 && (() => {
                const ayer = historialVisitas[1]?.visitas || 0;
                const hoy = historialVisitas[0]?.visitas || 0;
                if (ayer === 0) return null;
                const diff = Math.round(((hoy - ayer) / ayer) * 100);
                return (
                  <span className={`inline-flex items-center gap-1 text-xs font-bold mt-2 px-2 py-0.5 rounded-full ${
                    diff >= 0 ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
                  }`}>
                    {diff >= 0 ? '↑' : '↓'} {Math.abs(diff)}% vs ayer
                  </span>
                );
              })()}
            </div>

            {/* Card: En línea ahora */}
            <div className="bg-gray-800 border border-green-500/20 rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full"></div>
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
              <p className="text-xs text-green-400 font-black uppercase tracking-wider mb-1">En línea ahora</p>
              <p className="text-5xl font-black text-white leading-none">{activeUsers.length}</p>
              <p className="text-gray-500 text-xs mt-2">Con sesión iniciada</p>
            </div>

            {/* Card: Mejor día */}
            <div className="bg-gray-800 border border-purple-500/20 rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full"></div>
              <p className="text-xs text-purple-400 font-black uppercase tracking-wider mb-1">Récord (60 días)</p>
              {loadingVisitas ? (
                <div className="animate-pulse h-10 w-20 bg-gray-700 rounded-lg mt-1"></div>
              ) : (
                <p className="text-5xl font-black text-white leading-none">
                  {historialVisitas.length > 0 ? Math.max(...historialVisitas.map(d => d.visitas)) : '—'}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-2">Visitas en un día</p>
            </div>
          </div>

          {/* Lista de usuarios activos en tiempo real */}
          {activeUsers.length === 0 ? (
            <div className="text-center py-16 bg-gray-800 rounded-2xl border border-gray-700">
              <span className="text-5xl block mb-4 opacity-50">📡</span>
              <p className="text-gray-400 font-bold text-lg">Nadie conectado ahora mismo</p>
              <p className="text-gray-600 text-sm mt-2">Los usuarios con sesión aparecerán acá cuando naveguen la tienda.</p>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-3">Usuarios activos ahora</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeUsers.map((u, i) => (
                  <div key={i} className="bg-gray-800 border border-green-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-bl-full"></div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-gray-900 w-10 h-10 rounded-full flex items-center justify-center border border-gray-700 shrink-0">
                        <span className="text-lg">👤</span>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-gray-100 font-bold text-sm truncate">{u.email || 'Anónimo'}</p>
                        <span className="text-green-400 text-xs font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span> En línea
                        </span>
                      </div>
                    </div>
                    {u.online_at && (
                      <p className="text-gray-600 text-xs">
                        Desde: {new Date(u.online_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: HISTORIAL DE VISITAS */}
      {isHistorialOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsHistorialOpen(false)}></div>
          <div className="relative bg-gray-800 w-full max-w-2xl rounded-3xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

            {/* Header */}
            <div className="bg-gray-900 p-6 border-b border-gray-700 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  📅 Historial de Visitas
                </h3>
                <p className="text-gray-400 text-sm mt-0.5">Dispositivos únicos por día — últimos 60 días</p>
              </div>
              <button onClick={() => setIsHistorialOpen(false)} className="text-gray-400 hover:text-white bg-gray-800 hover:bg-red-500/20 p-2 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Tabla */}
            <div className="overflow-y-auto custom-scrollbar flex-grow">
              {loadingVisitas ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#FF9980]"></div>
                </div>
              ) : historialVisitas.length === 0 ? (
                <div className="text-center py-16">
                  <span className="text-4xl block mb-3">📊</span>
                  <p className="text-gray-400 font-bold">Aún no hay datos de visitas</p>
                  <p className="text-gray-600 text-sm mt-1">Empezarán a aparecer cuando alguien visite la tienda</p>
                </div>
              ) : (
                <table className="w-full text-sm text-gray-300">
                  <thead className="bg-gray-900 text-xs uppercase text-gray-500 border-b border-gray-700 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left font-black">Fecha</th>
                      <th className="px-6 py-4 text-center font-black">Visitas únicas</th>
                      <th className="px-6 py-4 text-center font-black">vs día anterior</th>
                      <th className="px-6 py-4 text-right font-black">Barra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialVisitas.map((dia, i) => {
                      const diaAnterior = historialVisitas[i + 1]?.visitas || 0;
                      const maxVisitas = Math.max(...historialVisitas.map(d => d.visitas));
                      const pct = maxVisitas > 0 ? Math.round((dia.visitas / maxVisitas) * 100) : 0;
                      let variacion = null;
                      if (diaAnterior > 0) {
                        const diff = Math.round(((dia.visitas - diaAnterior) / diaAnterior) * 100);
                        variacion = { diff, sube: diff >= 0 };
                      }
                      // Formateamos la fecha a dd/MM/yyyy
                      const [y, m, d] = dia.fecha.split('-');
                      const fechaStr = `${d}/${m}/${y}`;
                      const esHoy = i === 0;
                      return (
                        <tr key={dia.fecha} className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors ${
                          esHoy ? 'bg-[#FF9980]/5' : ''
                        }`}>
                          <td className="px-6 py-3">
                            <span className="font-bold text-gray-100">{fechaStr}</span>
                            {esHoy && (
                              <span className="ml-2 text-xs bg-[#FF9980]/20 text-[#FF9980] border border-[#FF9980]/30 px-1.5 py-0.5 rounded-full font-bold">hoy</span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className="font-black text-white text-base">{dia.visitas}</span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            {variacion ? (
                              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                                variacion.sube ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
                              }`}>
                                {variacion.sube ? '↑' : '↓'} {Math.abs(variacion.diff)}%
                              </span>
                            ) : (
                              <span className="text-gray-600 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-24 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-1.5 rounded-full bg-gradient-to-r from-[#FF9980] to-[#ff6040] transition-all"
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-900 px-6 py-4 border-t border-gray-700 flex justify-between items-center shrink-0">
              <p className="text-gray-500 text-xs">Total registrado: <span className="text-white font-bold">{historialVisitas.reduce((s, d) => s + d.visitas, 0)} visitas</span></p>
              <button onClick={() => setIsHistorialOpen(false)} className="text-gray-400 hover:text-white font-bold text-sm transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREAR / EDITAR PRODUCTO */}
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
                
                {/* CHECKBOX DE PRODUCTO DESTACADO AÑADIDO ACÁ */}
                <div className="flex items-center gap-3 bg-gray-900 border border-gray-600 rounded-xl p-4">
                  <input 
                    type="checkbox" 
                    id="featured" 
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                    className="w-5 h-5 accent-[#FF9980] bg-gray-800 border-gray-600 rounded cursor-pointer"
                  />
                  <label htmlFor="featured" className="text-[#FF9980] font-black text-sm uppercase tracking-wider cursor-pointer">
                    ⭐ Marcar como Producto Destacado
                  </label>
                </div>

                <div>
                  <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Foto del Producto *</label>
                  <div 
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all relative overflow-hidden group ${
                      isDragging ? 'border-[#FF9980] bg-[#FF9980]/10 scale-[1.02]' : 'border-gray-600 bg-gray-900 hover:border-gray-500 hover:bg-gray-800'
                    }`}
                  >
                    <input type="file" accept="image/*" onChange={onFileInput} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Arrastrá o hacé clic"/>
                    
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-3 py-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#FF9980]"></div>
                        <p className="text-sm text-[#FF9980] font-bold animate-pulse">Subiendo imagen al servidor...</p>
                      </div>
                    ) : productForm.image ? (
                      <div className="flex flex-col items-center gap-3 relative z-0">
                        <div className="relative">
                          <img src={productForm.image} alt="Preview" className="h-32 w-32 rounded-lg object-cover border-2 border-[#FF9980] shadow-lg" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">Cambiar foto</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 font-bold">Arrastrá otra foto si querés cambiarla</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center gap-2 py-4">
                        <span className="text-4xl transition-transform group-hover:scale-110 mb-2">📸</span>
                        <p className="text-gray-200 font-black text-sm">Arrastrá tu foto acá o hacé clic</p>
                        <p className="text-gray-500 text-xs font-bold">JPG, PNG o WEBP</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Nombre del Producto *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setProductForm(prev => ({...prev, name: newName}));
                      setCategoryIsAISuggested(false);
                      suggestCategoryWithAI(newName, productForm.description, productForm.image);
                    }}
                    className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors"
                    placeholder="Ej: Termo Stanley 1L"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Precio ($) *</label>
                    <input type="number" required min="0" step="0.01" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors" placeholder="Ej: 15500" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider">Categoría *</label>
                      {isSuggestingCategory && (
                        <span className="flex items-center gap-1.5 text-xs text-purple-400 font-bold animate-pulse">
                          <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          IA analizando...
                        </span>
                      )}
                      {categoryIsAISuggested && !isSuggestingCategory && (
                        <span className="flex items-center gap-1 text-xs bg-purple-900/50 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded-full font-bold">
                          ✨ Sugerida por IA
                        </span>
                      )}
                    </div>
                    <select 
                      value={productForm.category} 
                      onChange={(e) => {
                        setProductForm(prev => ({...prev, category: e.target.value}));
                        setCategoryIsAISuggested(false); // Si edita manualmente, quita el badge
                      }}
                      className={`w-full bg-gray-900 rounded-xl p-3 text-gray-100 focus:outline-none transition-colors appearance-none cursor-pointer ${
                        categoryIsAISuggested
                          ? 'border-2 border-purple-600 focus:border-purple-400'
                          : 'border border-gray-600 focus:border-[#FF9980]'
                      }`}
                    >
                      {CATEGORIAS_BASE.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>

                    {categoryIsAISuggested && !isSuggestingCategory && (
                      <p className="text-xs text-gray-500 mt-1.5">Podés cambiarla con el selector si no estás de acuerdo.</p>
                    )}

                    {productForm.category === 'Otra...' && (
                      <input 
                        type="text" 
                        required
                        value={productForm.customCategory} 
                        onChange={(e) => setProductForm({...productForm, customCategory: e.target.value})} 
                        className="w-full bg-gray-900 border border-gray-500 rounded-xl p-3 mt-3 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors animate-fade-in" 
                        placeholder="Escribí la nueva categoría..." 
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Descripción Detallada</label>
                  <textarea rows="4" value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors resize-none" placeholder="Escribí las características principales..."></textarea>
                </div>

              </form>
            </div>

            <div className="bg-gray-900 p-6 border-t border-gray-700 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">Cancelar</button>
              
              <button type="submit" form="productForm" disabled={savingProduct || uploadingImage} className="bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black px-8 py-3 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none flex items-center gap-2">
                {savingProduct ? 'Guardando...' : 'Guardar Producto'}
              </button>
            </div>

          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s forwards; }
      `}</style>
    </div>
  );
}