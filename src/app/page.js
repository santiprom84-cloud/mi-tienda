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

  // 3. Lógica para la sección "Destacados"
  // Solo mostramos destacados si el usuario NO está buscando ni filtrando activamente
  const isDefaultView = searchQuery === '' && selectedCategory === 'TODOS' && sortOrder === 'default';
  
  // Tomamos los primeros 4 productos (los más recientes agregados a la base de datos)
  const featuredProducts = catalog.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 mt-4">
      
      {/* Encabezado de la tienda */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-6xl font-black text-[#FF9980] mb-4 drop-shadow-lg">
          Polirubro Online
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
          Encontrá tecnología, indumentaria, gaming y mucho más. Armá tu carrito y te confirmamos al instante.
        </p>
      </div>

      {/* SECCIÓN NUEVA: Productos Destacados (Solo visible en la vista por defecto) */}
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

      {/* Controles de búsqueda, orden y filtros */}
      <div className="bg-gray-800 p-4 sm:p-6 rounded-3xl shadow-xl border border-gray-700 mb-10 sticky top-20 z-40 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
          <div className="relative w-full md:w-2/3">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading || error !== null}
              className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-[#FF9980] focus:ring-1 focus:ring-[#FF9980] transition-colors disabled:opacity-50"
            />
          </div>

          <div className="w-full md:w-1/3 flex items-center gap-3">
            <label className="text-gray-400 font-bold text-sm hidden lg:block whitespace-nowrap">
              Ordenar:
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              disabled={loading || error !== null}
              className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF9980] focus:ring-1 focus:ring-[#FF9980] transition-colors disabled:opacity-50 appearance-none cursor-pointer font-bold"
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

        <div className="flex flex-wrap gap-2 w-full justify-start pt-4 border-t border-gray-700">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              disabled={loading || error !== null}
              className={`px-4 py-2 rounded-xl text-sm font-black tracking-wide transition-all disabled:opacity-50 ${
                selectedCategory === category 
                  ? 'bg-[#FF9980] text-gray-900 shadow-md transform scale-105' 
                  : 'bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-[#FF9980]/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Título dinámico para el resto del catálogo */}
      {!loading && !error && (
        <h3 className="text-xl font-bold text-gray-400 mb-6 px-2">
          {isDefaultView ? 'Catálogo Completo' : 'Resultados de tu búsqueda'}
        </h3>
      )}

      {/* Grilla Principal de Productos */}
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
        <div className="text-center py-20 bg-gray-800 rounded-3xl border border-gray-700 shadow-inner">
          <span className="text-6xl block mb-4">🔍</span>
          <h2 className="text-2xl font-bold text-gray-300">No encontramos resultados</h2>
          <p className="text-gray-500 mt-2">Probá buscando con otras palabras, cambiá el filtro de precios o las categorías.</p>
          <button 
            onClick={() => {setSearchQuery(''); setSelectedCategory('TODOS'); setSortOrder('default');}}
            className="mt-6 text-[#FF9980] hover:text-white font-bold underline transition-colors"
          >
            Limpiar filtros y ver todo el catálogo
          </button>
        </div>
      )}
      
    </div>
  );
}