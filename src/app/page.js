'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [catalog, setCatalog] = useState([]);
  const [categories, setCategories] = useState(['TODOS']);
  
  // Estados para los filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [sortOrder, setSortOrder] = useState('default'); 
  
  // NUEVO ESTADO: Controla si el menú lateral (Hamburguesa) está abierto o cerrado
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch('/api/productos');
        const textResponse = await response.text();
        
        let data;
        try {
          data = JSON.parse(textResponse);
        } catch (err) {
          throw new Error("Error conectando con la API de productos.");
        }

        if (!response.ok) {
          throw new Error(data.error || 'Error al cargar el catálogo');
        }

        setCatalog(data.productos);
        
        const uniqueCategories = ['TODOS', ...new Set(data.productos.map(p => p.category))];
        setCategories(uniqueCategories);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // 1. Lógica de Filtrado
  let filteredProducts = catalog.filter(product => {
    const matchesCategory = selectedCategory === 'TODOS' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // 2. Lógica de Ordenamiento
  if (sortOrder === 'asc') {
    filteredProducts.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortOrder === 'desc') {
    filteredProducts.sort((a, b) => Number(b.price) - Number(a.price));
  }

  // Lógica para la sección "Destacados"
  const isDefaultView = searchQuery === '' && selectedCategory === 'TODOS' && sortOrder === 'default';
  const featuredProducts = catalog.slice(0, 4);

  // Saber si hay filtros activos para ponerle un "puntito" rojo al menú
  const hasActiveFilters = !isDefaultView;

  return (
    <div className="relative min-h-screen">
      
      {/* =========================================
          MENÚ LATERAL (SIDEBAR OFF-CANVAS)
      ============================================= */}
      
      {/* Fondo oscuro desenfocado (Backdrop) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Panel Lateral */}
      <div className={`fixed top-0 left-0 h-full w-full sm:w-80 bg-gray-900 border-r border-gray-800 shadow-2xl z-[110] transform transition-transform duration-300 ease-in-out overflow-y-auto flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Cabecera del Panel */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-950 sticky top-0 z-10">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>⚙️</span> Filtros y Categorías
          </h2>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-400 hover:text-[#FF9980] bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Contenido del Panel */}
        <div className="p-6 flex flex-col gap-8 flex-grow">
          
          {/* 1. Buscador */}
          <div>
            <label className="block text-[#FF9980] font-black text-sm uppercase tracking-wider mb-3">Buscar Producto</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Ej: Teclado, Termo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#FF9980] focus:ring-1 focus:ring-[#FF9980] transition-colors"
              />
            </div>
          </div>

          {/* 2. Categorías */}
          <div>
            <label className="block text-[#FF9980] font-black text-sm uppercase tracking-wider mb-3">Categorías</label>
            <div className="flex flex-col gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`text-left px-4 py-3 rounded-xl font-bold transition-all flex justify-between items-center ${
                    selectedCategory === category 
                      ? 'bg-[#FF9980]/20 border border-[#FF9980] text-[#FF9980]' 
                      : 'bg-gray-800 border border-transparent text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {category}
                  {selectedCategory === category && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Ordenar por Precio */}
          <div>
            <label className="block text-[#FF9980] font-black text-sm uppercase tracking-wider mb-3">Ordenar por</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF9980] focus:ring-1 focus:ring-[#FF9980] transition-colors appearance-none cursor-pointer font-bold"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FF9980'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
                backgroundPosition: `right 1rem center`, 
                backgroundRepeat: `no-repeat`, 
                backgroundSize: `1.2em 1.2em`, 
                paddingRight: `2.5rem` 
              }}
            >
              <option value="default">⭐ Más recientes</option>
              <option value="asc">💸 Menor precio primero</option>
              <option value="desc">💎 Mayor precio primero</option>
            </select>
          </div>

        </div>

        {/* Botón inferior para aplicar y cerrar */}
        <div className="p-6 border-t border-gray-800 bg-gray-900 sticky bottom-0 z-10">
          {hasActiveFilters && (
            <button 
              onClick={() => {setSearchQuery(''); setSelectedCategory('TODOS'); setSortOrder('default');}}
              className="w-full mb-3 text-gray-400 hover:text-white font-bold underline transition-colors text-sm"
            >
              Limpiar todos los filtros
            </button>
          )}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="w-full bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-4 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1"
          >
            Ver {filteredProducts.length} productos
          </button>
        </div>
      </div>
      {/* =========================================
          FIN MENÚ LATERAL
      ============================================= */}


      <div className="max-w-7xl mx-auto p-4 sm:p-8 mt-2">
        
        {/* BARRA SUPERIOR DE HERRAMIENTAS (Botón Menú Hamburguesa) */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="group flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-5 py-3 rounded-xl border border-gray-700 transition-all shadow-md relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF9980] group-hover:scale-110 transition-transform"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            <span className="font-black tracking-wide hidden sm:inline">MENÚ DE PRODUCTOS</span>
            <span className="font-black tracking-wide sm:hidden">MENÚ</span>
            
            {/* Puntito rojo si hay filtros activos */}
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full border-2 border-gray-900 animate-pulse"></span>
            )}
          </button>

          {!loading && !error && (
            <span className="text-gray-400 font-bold text-sm bg-gray-900/50 px-4 py-2 rounded-lg">
              Mostrando <span className="text-[#FF9980]">{filteredProducts.length}</span> artículos
            </span>
          )}
        </div>

        {/* Encabezado Principal */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
            Polirubro <span className="text-[#FF9980]">Online</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Explorá nuestro catálogo con el menú superior. Encontrá tecnología, indumentaria, gaming y mucho más.
          </p>
        </div>

        {/* SECCIÓN: Novedades Destacadas */}
        {!loading && !error && isDefaultView && featuredProducts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl animate-pulse">🔥</span>
              <h2 className="text-3xl font-black text-gray-100 uppercase tracking-wider">
                Novedades Destacadas
              </h2>
              <div className="flex-grow h-1 bg-gradient-to-r from-[#FF9980] to-transparent rounded-full opacity-50"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {featuredProducts.map(product => (
                <ProductCard key={`featured-${product.id}`} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Título dinámico para el resto del catálogo */}
        {!loading && !error && (
          <h3 className="text-2xl font-black text-gray-300 mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
            {isDefaultView ? 'Catálogo Completo' : `Resultados para tu búsqueda`}
          </h3>
        )}

        {/* GRILLA PRINCIPAL */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF9980]"></div>
            <p className="text-[#FF9980] font-bold mt-4 animate-pulse">Cargando catálogo...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-gray-800 rounded-3xl border border-red-500/50">
            <span className="text-6xl block mb-4">⚠️</span>
            <h2 className="text-2xl font-bold text-red-400">Oops, algo salió mal</h2>
            <p className="text-gray-400 mt-2">{error}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-800 rounded-3xl border border-gray-700 shadow-inner flex flex-col items-center">
            <span className="text-6xl block mb-4">🔍</span>
            <h2 className="text-2xl font-bold text-gray-300">No encontramos resultados</h2>
            <p className="text-gray-500 mt-2">No hay productos que coincidan con esos filtros.</p>
            <button 
              onClick={() => {setSearchQuery(''); setSelectedCategory('TODOS'); setSortOrder('default');}}
              className="mt-6 bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-3 px-6 rounded-xl transition-colors"
            >
              Ver todo el catálogo
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}