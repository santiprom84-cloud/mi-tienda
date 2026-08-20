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
  
  // Estados para Búsqueda, Categorías y Orden
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [sortOrder, setSortOrder] = useState('recientes'); // 'recientes', 'mayor_precio', 'menor_precio'
  
  // Estado para abrir/cerrar el menú lateral de categorías (Hamburguesa)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*');
      
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

  const categories = ['Todas', ...new Set(products.map(p => p.category).filter(Boolean))];

  // 1. Primero filtramos
  let filteredAndSorted = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 2. Luego ordenamos el resultado
  if (sortOrder === 'mayor_precio') {
    filteredAndSorted.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sortOrder === 'menor_precio') {
    filteredAndSorted.sort((a, b) => Number(a.price) - Number(b.price));
  } else {
    // Por defecto: Más recientes (usando la fecha de creación)
    filteredAndSorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 mt-4 mb-20">
      
      {/* MENÚ LATERAL DE CATEGORÍAS (Overlay oculto) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Fondo oscuro que al tocarlo cierra el menú */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          
          {/* Panel Lateral */}
          <div className="relative w-72 max-w-[80%] bg-gray-900 h-full p-6 shadow-2xl flex flex-col border-r border-gray-700 animate-slide-right">
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>📁</span> Categorías
              </h2>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="bg-gray-800 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-red-500/20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-grow pr-2">
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsSidebarOpen(false); // Cierra el menú al elegir
                  }}
                  className={`text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    selectedCategory === category 
                      ? 'bg-[#FF9980] text-gray-900 shadow-md' 
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Banner Principal */}
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

      {/* BARRA DE HERRAMIENTAS: Búsqueda, Menú y Orden */}
      <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 mb-8 shadow-lg sticky top-24 z-40">
        <div className="flex flex-col gap-3">
          
          {/* Fila 1: Menú Hamburguesa + Buscador */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="bg-gray-900 p-3 sm:p-4 rounded-xl border border-gray-600 text-gray-100 hover:border-[#FF9980] hover:text-[#FF9980] transition-colors shadow-inner flex-shrink-0"
              title="Abrir Categorías"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-10 pr-4 py-3 sm:py-4 text-sm sm:text-base text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors shadow-inner"
              />
            </div>
          </div>

          {/* Fila 2: Indicador de categoría actual + Filtro de Orden */}
          <div className="flex justify-between items-center bg-gray-900/50 p-2 sm:p-3 rounded-xl border border-gray-700/50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase font-bold tracking-wider hidden sm:block">Categoría:</span>
              <span className="bg-[#FF9980]/10 text-[#FF9980] px-3 py-1 rounded-md text-xs font-bold border border-[#FF9980]/20 truncate max-w-[150px] sm:max-w-xs">
                {selectedCategory}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hidden sm:block"><path d="M3 3h18v18H3zM12 8v8m-4-4h8"/></svg>
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-gray-800 border border-gray-600 text-gray-200 text-xs sm:text-sm rounded-lg focus:outline-none focus:border-[#FF9980] py-1.5 px-2 appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FF9980'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em', paddingRight: '2rem' }}
              >
                <option value="recientes">Novedades (Recientes)</option>
                <option value="menor_precio">Menor Precio</option>
                <option value="mayor_precio">Mayor Precio</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* TITULO DE RESULTADOS */}
      <div className="flex justify-between items-end mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <span>{filteredProducts.length > 0 ? '🔥' : '🔍'}</span> 
          {searchTerm || selectedCategory !== 'Todas' ? 'Resultados' : 'Catálogo Completo'}
        </h2>
        <span className="text-gray-400 text-xs sm:text-sm font-bold bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
          {filteredProducts.length} productos
        </span>
      </div>

      {/* GRILLA DE PRODUCTOS */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#FF9980]"></div>
          <p className="text-gray-400 font-bold mt-4 animate-pulse">Cargando tus 193 productos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/50 rounded-3xl border border-dashed border-gray-700">
          <span className="text-6xl block mb-4 opacity-50">📦</span>
          <h3 className="text-xl font-bold text-gray-300 mb-2">No encontramos nada</h3>
          <p className="text-gray-500 text-sm sm:text-base">Probá buscando con otras palabras o cambiá de categoría en el menú.</p>
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

      {/* ANIMACIÓN TAILWIND (Agregada en línea para el menú lateral) */}
      <style jsx global>{`
        @keyframes slide-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-right {
          animation: slide-right 0.3s ease-out forwards;
        }
      `}</style>

      {addedToast && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-11/12 max-w-sm bg-[#25D366] text-gray-900 px-6 py-4 rounded-2xl shadow-2xl font-black text-sm flex items-center justify-center gap-3 z-50 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <span className="truncate flex-grow text-center">{addedToast} en tu carrito</span>
        </div>
      )}

    </div>
  );
}