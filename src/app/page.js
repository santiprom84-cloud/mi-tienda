'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [catalog, setCatalog] = useState([]);
  const [categories, setCategories] = useState(['TODOS']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  
  // Estados para manejar la carga y los errores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect se ejecuta apenas el cliente entra a la página para ir a buscar los productos a Supabase
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
        
        // Extraemos las categorías únicas de lo que devuelva la base de datos
        const uniqueCategories = ['TODOS', ...new Set(data.productos.map(p => p.category))];
        setCategories(uniqueCategories);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Apagamos la animación de carga
      }
    };

    fetchProductos();
  }, []);

  // Lógica de filtrado doble (por texto y por categoría)
  const filteredProducts = catalog.filter(product => {
    const matchesCategory = selectedCategory === 'TODOS' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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

      {/* Controles de búsqueda y filtros */}
      <div className="bg-gray-800 p-4 sm:p-6 rounded-3xl shadow-xl border border-gray-700 mb-10 sticky top-20 z-40">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Buscador de texto */}
          <div className="relative w-full md:w-1/2">
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

          {/* Botones de Categorías */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-end">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                disabled={loading || error !== null}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${
                  selectedCategory === category 
                    ? 'bg-[#FF9980] text-gray-900 shadow-md' 
                    : 'bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-500'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Manejo de Estados: Cargando, Error o Grilla */}
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
        <div className="text-center py-20 bg-gray-800 rounded-3xl border border-gray-700">
          <span className="text-6xl block mb-4">🔍</span>
          <h2 className="text-2xl font-bold text-gray-300">No encontramos resultados</h2>
          <p className="text-gray-500 mt-2">Probá buscando con otras palabras o limpiá los filtros.</p>
          <button 
            onClick={() => {setSearchQuery(''); setSelectedCategory('TODOS');}}
            className="mt-6 text-[#FF9980] hover:text-white font-bold underline"
          >
            Ver todo el catálogo
          </button>
        </div>
      )}
      
    </div>
  );
}