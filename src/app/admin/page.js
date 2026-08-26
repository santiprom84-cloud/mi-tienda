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

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPromptText, setAiPromptText] = useState('');
  const [aiResponseText, setAiResponseText] = useState('');
  const [isApplyingAI, setIsApplyingAI] = useState(false);

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

  const openAIModal = () => {
    const productsToClassify = adminProducts.map(p => ({ id: p.id, name: p.name }));
    const prompt = `Eres un experto en e-commerce. Analiza estos productos y asígnales una categoría principal.
Usa estas sugerencias base: "Tecnología y Gaming", "Bazar y Parrilla", "Deportes y Tiempo Libre", "Librería y Estudio", "Accesorios y Telefonía", "Indumentaria", "Juguetería".
Devuelve SOLO un JSON válido (sin texto antes ni después) con este formato exacto:
[
  {"id": "el_id_aqui", "category": "Categoria Asignada"}
]

PRODUCTOS:
${JSON.stringify(productsToClassify)}`;

    setAiPromptText(prompt);
    setAiResponseText('');
    setIsAIModalOpen(true);
  };

  const applyAIResponse = async () => {
    if (!aiResponseText.trim()) {
      alert("Pegá el JSON que te dio la IA primero.");
      return;
    }
    setIsApplyingAI(true);
    try {
      let cleanText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const clasificaciones = JSON.parse(cleanText);

      if (!Array.isArray(clasificaciones)) {
        throw new Error("El formato no es una lista válida.");
      }

      let procesados = 0;
      for (const item of clasificaciones) {
        if (item.id && item.category) {
          await supabase.from('productos').update({ category: item.category.trim() }).eq('id', item.id);
          procesados++;
        }
      }

      alert(`¡Modo Seguro Exitoso! Se reordenaron ${procesados} productos correctamente.`);
      setIsAIModalOpen(false);
      fetchAdminData();
    } catch (error) {
      alert(`Error leyendo el JSON: ${error.message}.`);
    } finally {
      setIsApplyingAI(false);
    }
  };

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(aiPromptText);
    alert("¡Comando copiado! Pegalo en ChatGPT o Gemini.");
  };

  const openProductModal = (product = null) => {
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
        featured: product.featured || false // Cargamos si es destacado
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
                onClick={openAIModal}
                className="w-full sm:w-auto bg-[#FF9980]/20 hover:bg-[#FF9980]/30 text-[#FF9980] border border-[#FF9980]/50 font-black px-4 py-2.5 sm:py-3 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                🧠 Reordenar Catálogo
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
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <h2 className="text-xl font-black text-white">Radar en Vivo</h2>
            </div>
            <p className="text-gray-400 text-sm">Usuarios con sesión activa en este momento.</p>
          </div>

          {activeUsers.length === 0 ? (
            <div className="text-center py-20 bg-gray-800 rounded-2xl border border-gray-700">
              <span className="text-5xl block mb-4 opacity-50">📡</span>
              <p className="text-gray-400 font-bold text-lg">Nadie conectado ahora mismo</p>
              <p className="text-gray-600 text-sm mt-2">Los usuarios aparecerán aquí cuando naveguen la tienda con sesión iniciada.</p>
            </div>
          ) : (
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
          )}
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
                  <input type="text" required value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors" placeholder="Ej: Termo Stanley 1L" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Precio ($) *</label>
                    <input type="number" required min="0" step="0.01" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors" placeholder="Ej: 15500" />
                  </div>
                  
                  <div>
                    <label className="block text-[#FF9980] font-black text-xs uppercase tracking-wider mb-2">Categoría *</label>
                    <select 
                      value={productForm.category} 
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors appearance-none cursor-pointer"
                    >
                      {CATEGORIAS_BASE.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>

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

      {/* MODAL: IA (Oculto por brevedad, está implementado en la app real) */}

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s forwards; }
      `}</style>
    </div>
  );
}