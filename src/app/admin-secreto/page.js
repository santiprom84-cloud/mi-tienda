'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminPage() {
  // === ESTADOS PARA EL FORMULARIO INDIVIDUAL ===
  const [product, setProduct] = useState({
    name: '',
    price: '',
    image: '',
    category: '',
    description: ''
  });
  
  // NUEVOS ESTADOS PARA LA IMAGEN
  const [imageFile, setImageFile] = useState(null); // Guarda el archivo físico
  const [imagePreview, setImagePreview] = useState(''); // Muestra la foto antes de subirla

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);

  // === ESTADOS PARA CARGA MASIVA ===
  const [excelData, setExcelData] = useState('');
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');

  // === ESTADOS PARA LA LISTA DE INVENTARIO ===
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInventory = async () => {
    setLoadingInventory(true);
    const { data, error } = await supabase
      .from('productos')
      .select('*');
      
    if (!error && data) {
      setInventory(data.reverse());
    }
    setLoadingInventory(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // FUNCIÓN: Manejar la selección de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Creamos un link temporal para que puedas ver la foto en pantalla antes de subirla
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  // FUNCIÓN: Subir producto (Nuevo o Editado) con la imagen física
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      let finalImageUrl = product.image; // Por defecto, mantenemos la URL actual (si estamos editando)

      // SI EL USUARIO SELECCIONÓ UNA FOTO NUEVA, LA SUBIMOS A SUPABASE STORAGE PRIMERO
      if (imageFile) {
        // Generamos un nombre único para la foto usando la fecha exacta para que no haya duplicados
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // 1. Subimos el archivo físico al balde 'productos'
        const { error: uploadError } = await supabase.storage
          .from('productos')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Error subiendo la imagen: ${uploadError.message}`);
        }

        // 2. Le pedimos a Supabase el Link Directo Público de esa foto
        const { data: { publicUrl } } = supabase.storage
          .from('productos')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl; // Reemplazamos la URL con la nueva de nuestro servidor
      }

      // Validamos que haya una imagen sí o sí
      if (!finalImageUrl) {
        throw new Error('Por favor, seleccioná o subí una imagen.');
      }

      const cleanPrice = Number(String(product.price).replace(/[^0-9]/g, ''));
      
      if (editingId) {
        // MODO EDICIÓN
        const { error } = await supabase
          .from('productos')
          .update({
            name: product.name,
            price: cleanPrice,
            image: finalImageUrl,
            category: product.category.toUpperCase(),
            description: product.description
          })
          .eq('id', editingId);

        if (error) throw error;
        setMessage('✅ Producto actualizado con éxito.');
        setEditingId(null);
      } else {
        // MODO CREACIÓN
        const { error } = await supabase
          .from('productos')
          .insert([{
            name: product.name,
            price: cleanPrice,
            image: finalImageUrl,
            category: product.category.toUpperCase(),
            description: product.description
          }]);

        if (error) throw error;
        setMessage('✅ Producto publicado con éxito.');
      }

      // Limpiamos los estados
      setProduct({ name: '', price: '', image: '', category: '', description: '' });
      setImageFile(null);
      setImagePreview('');
      fetchInventory();
      
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setProduct({
      name: item.name,
      price: item.price.toString(),
      image: item.image,
      category: item.category,
      description: item.description || ''
    });
    // Limpiamos la foto nueva temporal al editar
    setImageFile(null);
    setImagePreview('');
    setMessage('✏️ Modo edición activado. Modificá los datos y guardá.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setProduct({ name: '', price: '', image: '', category: '', description: '' });
    setImageFile(null);
    setImagePreview('');
    setMessage('');
  };

  const handleDeleteClick = async (id, name, imageUrl) => {
    const confirmDelete = window.confirm(`¿Estás 100% seguro de que querés borrar el producto "${name}"? Esta acción no se puede deshacer.`);
    if (!confirmDelete) return;

    try {
      // 1. Borramos el producto de la base de datos
      const { error: dbError } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // 2. Borramos la foto física de Supabase Storage para no ocupar espacio
      if (imageUrl && imageUrl.includes('supabase.co')) {
        const fileName = imageUrl.split('/').pop();
        await supabase.storage.from('productos').remove([fileName]);
      }

      fetchInventory();
    } catch (error) {
      alert(`Error al borrar: ${error.message}`);
    }
  };

  const handleBulkSubmit = async () => {
    if (!excelData.trim()) {
      setBulkMessage('⚠️ Pegá los datos de tu Excel primero.');
      return;
    }
    setIsBulkSubmitting(true);
    setBulkMessage('');

    try {
      const rows = excelData.trim().split('\n');
      const productsToAdd = rows.map((row, index) => {
        const columns = row.split('\t');
        if (columns.length < 5) {
          throw new Error(`La fila ${index + 1} no tiene las 5 columnas.`);
        }
        return {
          name: columns[0].trim(),
          price: Number(columns[1].replace(/[^0-9]/g, '')),
          image: columns[2].trim(), // Para Excel seguimos usando links web si los tenés
          category: columns[3].trim().toUpperCase(),
          description: columns[4].trim()
        };
      });

      const { error } = await supabase.from('productos').insert(productsToAdd);
      if (error) throw error;

      setBulkMessage(`✅ ¡Éxito! Se cargaron ${productsToAdd.length} productos.`);
      setExcelData('');
      fetchInventory(); 
    } catch (error) {
      setBulkMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsBulkSubmitting(false);
      setTimeout(() => setBulkMessage(''), 5000);
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 mt-4 mb-20">
      
      <div className="flex justify-between items-center mb-10 bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-xl">
        <div>
          <h1 className="text-4xl font-black text-[#FF9980] mb-2">Centro de Control</h1>
          <p className="text-gray-400">Gestioná tu inventario en tiempo real.</p>
        </div>
        <Link href="/" className="bg-gray-900 text-[#FF9980] hover:text-white border border-gray-700 hover:border-[#FF9980] px-6 py-3 rounded-xl font-bold transition-all shadow-md">
          Ir a la tienda
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        
        {/* CARGA MASIVA */}
        <div className="bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-700 shadow-xl flex flex-col h-full">
          <h2 className="text-2xl font-black text-gray-100 mb-2 flex items-center gap-2">
            <span>⚡</span> Carga Masiva (Excel)
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            <strong className="text-[#FF9980]">Orden:</strong> Nombre | Precio | Link Imagen | Categoría | Descripción
          </p>
          <textarea 
            value={excelData}
            onChange={(e) => setExcelData(e.target.value)}
            className="flex-grow w-full min-h-[250px] bg-gray-900 border border-gray-600 rounded-xl p-4 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors resize-none font-mono text-sm whitespace-pre"
            placeholder="Pegá acá las filas de tu Excel (sin títulos)..."
          />
          <button 
            onClick={handleBulkSubmit}
            disabled={isBulkSubmitting}
            className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white font-black py-4 rounded-xl transition-all shadow-md disabled:opacity-50"
          >
            {isBulkSubmitting ? 'Procesando masivamente...' : 'Cargar a Base de Datos'}
          </button>
          {bulkMessage && (
            <div className={`mt-4 p-3 rounded-xl text-center font-bold text-sm ${bulkMessage.includes('✅') ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
              {bulkMessage}
            </div>
          )}
        </div>

        {/* CARGA INDIVIDUAL CON SOLTAR IMAGEN */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl transition-colors flex flex-col justify-between ${editingId ? 'bg-blue-900/20 border-blue-500/50' : 'bg-gray-800 border-gray-700'}`}>
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-100 flex items-center gap-2">
                <span>{editingId ? '✏️' : '📦'}</span> {editingId ? 'Editando Producto' : 'Carga Individual'}
              </h2>
              {editingId && (
                <button onClick={handleCancelEdit} className="text-red-400 hover:text-red-300 text-sm font-bold underline">
                  Cancelar edición
                </button>
              )}
            </div>
            
            <form id="productForm" onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold mb-2 text-sm">Nombre</label>
                  <input 
                    type="text" required value={product.name}
                    onChange={(e) => setProduct({...product, name: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-2 text-sm">Precio (solo n°)</label>
                  <input 
                    type="number" required value={product.price}
                    onChange={(e) => setProduct({...product, price: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980]"
                  />
                </div>
              </div>

              {/* ZONA DE ARRASTRAR Y SOLTAR IMAGEN */}
              <div>
                <label className="block text-gray-400 font-bold mb-2 text-sm">Imagen del producto</label>
                <div className="relative border-2 border-dashed border-gray-600 bg-gray-900/50 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-[#FF9980] hover:bg-gray-900 transition-all cursor-pointer min-h-[160px] overflow-hidden group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Arrastrá o hacé clic para buscar foto"
                  />
                  
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2" />
                  ) : product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image} alt="Actual" className="absolute inset-0 w-full h-full object-contain p-2" />
                  ) : (
                    <div className="text-gray-400 group-hover:text-[#FF9980] transition-colors pointer-events-none">
                      <span className="text-4xl block mb-2">📸</span>
                      <p className="font-bold">Arrastrá tu foto acá o hacé clic para buscar</p>
                      <p className="text-xs mt-1">Soporta JPG, PNG, WEBP</p>
                    </div>
                  )}
                  
                  {/* Etiqueta flotante para indicar que se puede cambiar la foto si ya hay una */}
                  {(imagePreview || product.image) && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-bold bg-[#FF9980]/90 px-4 py-2 rounded-full pointer-events-none">Cambiar imagen</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold mb-2 text-sm">Categoría</label>
                  <input 
                    type="text" required value={product.category}
                    onChange={(e) => setProduct({...product, category: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980] uppercase"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-2 text-sm">Descripción</label>
                  <textarea 
                    required rows="3" value={product.description}
                    onChange={(e) => setProduct({...product, description: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980] resize-none"
                  ></textarea>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-6">
            <button 
              form="productForm"
              type="submit" disabled={isSubmitting}
              className={`w-full font-black py-4 rounded-xl shadow-md transition-all disabled:opacity-50 text-gray-900 ${editingId ? 'bg-blue-400 hover:bg-blue-500' : 'bg-[#FF9980] hover:bg-[#ff8060]'}`}
            >
              {isSubmitting ? 'Guardando imagen y producto...' : (editingId ? 'Guardar Cambios' : 'Publicar Producto')}
            </button>

            {message && (
              <div className={`mt-3 p-3 rounded-xl text-center font-bold text-sm ${message.includes('✅') ? 'bg-green-900/50 text-green-400 border border-green-800' : (message.includes('✏️') ? 'bg-blue-900/50 text-blue-400 border border-blue-800' : 'bg-red-900/50 text-red-400 border border-red-800')}`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INVENTARIO */}
      <div className="bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-700 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-black text-gray-100 flex items-center gap-2">
            <span>📋</span> Inventario Actual ({filteredInventory.length})
          </h2>
          
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar en inventario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-[#FF9980] focus:ring-1 focus:ring-[#FF9980] transition-colors"
            />
          </div>
        </div>
        
        {loadingInventory ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#FF9980]"></div>
          </div>
        ) : filteredInventory.length === 0 ? (
          <p className="text-gray-400 text-center py-10">No se encontraron productos con esa búsqueda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold">Imagen</th>
                  <th className="p-4 font-bold">Nombre</th>
                  <th className="p-4 font-bold">Categoría</th>
                  <th className="p-4 font-bold">Precio</th>
                  <th className="p-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-gray-600" />
                    </td>
                    <td className="p-4 font-bold text-gray-100">{item.name}</td>
                    <td className="p-4 text-sm text-[#FF9980]">{item.category}</td>
                    <td className="p-4 font-mono text-gray-300">${item.price.toLocaleString('es-AR')}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleEditClick(item)}
                          className="bg-gray-900 border border-gray-600 hover:border-blue-500 hover:text-blue-400 text-gray-400 p-2 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(item.id, item.name, item.image)}
                          className="bg-gray-900 border border-gray-600 hover:border-red-500 hover:text-red-400 text-gray-400 p-2 rounded-lg transition-colors"
                          title="Borrar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}