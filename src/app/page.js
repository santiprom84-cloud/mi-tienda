'use client';

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';

// Catálogo inicial de productos
const catalog = [
  {
    id: '1',
    name: 'Teclado Mecánico Aula F75 Creamy',
    description: 'Teclado formato 75% con switches lineales cremosos. Sonido espectacular, ideal para tipear apuntes y jugar al máximo nivel.',
    price: 95000,
    category: 'TECNOLOGÍA',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'Camiseta Oficial Talleres',
    description: 'Camiseta titular. Tela transpirable de alta tecnología y escudo termosellado. Para alentar en cada partido.',
    price: 55000,
    category: 'INDUMENTARIA',
    image: 'https://images.unsplash.com/photo-1508344928928-7137b2938833?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'Volante Sim Racing Force Feedback',
    description: 'Volante de alta precisión para simuladores de carreras como Assetto Corsa. Inmersión y sensibilidad total en la pista.',
    price: 250000,
    category: 'GAMING',
    image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'Pantalón Baggy Oversize',
    description: 'Pantalón estilo baggy súper cómodo. Tela resistente, bolsillos amplios y corte ancho, ideal para el día a día.',
    price: 35000,
    category: 'INDUMENTARIA',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '5',
    name: 'Tablet para Apuntes Digitales',
    description: 'Pantalla de alta resolución y compatibilidad con lápiz óptico. Perfecta para tomar notas en la facu o ver streams.',
    price: 180000,
    category: 'TECNOLOGÍA',
    image: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?q=80&w=600&auto=format&fit=crop'
  }
];

// Extraemos las categorías únicas automáticamente del catálogo
const categories = ['TODOS', ...new Set(catalog.map(p => p.category))];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');

  // Lógica de filtrado doble (por texto y por categoría)
  const filteredProducts = catalog.filter(product => {
    const matchesCategory = selectedCategory === 'TODOS' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
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
              className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-[#FF9980] focus:ring-1 focus:ring-[#FF9980] transition-colors"
            />
          </div>

          {/* Botones de Categorías */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-end">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
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

      {/* Grilla de resultados */}
      {filteredProducts.length > 0 ? (
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