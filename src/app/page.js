'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedToast, setAddedToast] = useState(null);
  
  // Estados para el Buscador y Categorías
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Traemos TODOS los productos reales de tu base de datos
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false }); // Los más nuevos primero
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedToast(product.name);
    setTimeout(() => setAddedToast(null), 3000);
  };

  // Extraemos las categorías únicas de tu base de datos para armar los botones
  const categories = ['Todas', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filtramos los productos según lo que el cliente escriba o la categoría que toque
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 mt-4 mb-20">
      
      {/* Banner Principal Responsivo */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-6 sm:p-12 mb-8 border border-gray-700 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#FF9980] rounded-full blur-[100px] opacity-20"></div>
        <div className="relative z-10 text-center sm:text-left">
          <span className="bg-[#FF9980]/20 text-[#FF9980] px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block border border-[#FF9980]/30">
            Catálogo Online
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Todo lo que buscás, <br className="hidden sm:block" />
            <span className="text-[#FF9980]">en un solo lugar.</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto sm:mx-0">
            Envíos a toda Córdoba Capital. Explorá nuestro catálogo y comprá seguro desde casa.
          </p>
        </div>
      </div>

      {/* Buscador y Filtros (NUEVO) */}
      <div className="bg-gray-800 p-4 sm:p-6 rounded-2xl border border-gray-700 mb-8 shadow-lg sticky top-24 z-40">
        <div className="flex flex-col gap-4">
          
          {/* Barra de Búsqueda */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <input
              type="text"
              placeholder="Buscar productos por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors shadow-inner"
            />
          </div>

          {/* Botones de Categorías Dinámicos */}
          <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                  selectedCategory === category 
                    ? 'bg-[#FF9980] text-gray-900 border-[#FF9980] shadow-md transform scale-105' 
                    : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-[#FF9980]/50 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* RESULTADOS Y GRILLA DE PRODUCTOS */}
      <div className="flex justify-between items-end mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <span>{filteredProducts.length > 0 ? '🔥' : '🔍'}</span> 
          {searchTerm || selectedCategory !== 'Todas' ? 'Resultados de tu búsqueda' : 'Catálogo Completo'}
        </h2>
        <span className="text-gray-400 text-xs sm:text-sm font-bold bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
          {filteredProducts.length} productos
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#FF9980]"></div>
          <p className="text-gray-400 font-bold mt-4 animate-pulse">Cargando tu catálogo...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/50 rounded-3xl border border-dashed border-gray-700">
          <span className="text-6xl block mb-4 opacity-50">📦</span>
          <h3 className="text-xl font-bold text-gray-300 mb-2">No encontramos nada</h3>
          <p className="text-gray-500">Probá buscando con otras palabras o cambiá de categoría.</p>
          <button 
            onClick={() => {setSearchTerm(''); setSelectedCategory('Todas');}}
            className="mt-6 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold transition-colors"
          >
            Ver todos los productos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-700 shadow-lg overflow-hidden flex flex-col hover:border-[#FF9980]/50 transition-all group">
              
              <div className="relative aspect-square w-full bg-gray-900 overflow-hidden">
                {product.category && (
                  <span className="absolute top-2 left-2 z-10 bg-gray-900/80 backdrop-blur-sm text-gray-200 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md border border-gray-700">
                    {product.category}
                  </span>
                )}
                <img 
                  src={product.image || 'https://via.placeholder.com/500?text=Sin+Imagen'} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-3 sm:p-5 flex flex-col flex-grow">
                <h3 className="text-xs sm:text-base font-bold text-gray-100 line-clamp-2 mb-1 sm:mb-2 h-8 sm:h-12" title={product.name}>
                  {product.name}
                </h3>
                
                <div className="mt-auto">
                  <p className="text-lg sm:text-2xl font-black text-[#FF9980] mb-3 sm:mb-4">
                    ${Number(product.price).toLocaleString('es-AR')}
                  </p>
                  
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-transform transform active:scale-95 flex items-center justify-center gap-1 sm:gap-2 shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden sm:block"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    Sumar al carro
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {addedToast && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-11/12 max-w-sm bg-[#25D366] text-gray-900 px-6 py-4 rounded-2xl shadow-2xl font-black text-sm flex items-center justify-center gap-3 z-50 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <span className="truncate flex-grow text-center">{addedToast} en tu carrito</span>
        </div>
      )}

    </div>
  );
}