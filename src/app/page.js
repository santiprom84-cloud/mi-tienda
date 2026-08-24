'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton'; // Restauramos tu botón flotante

export default function HomePage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProductos = async () => {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProductos(data);
      }
      setLoading(false);
    };

    fetchProductos();
  }, []);

  const categorias = ['Todas', ...new Set(productos.map(p => p.category).filter(Boolean))];

  const productosFiltrados = productos.filter(p => {
    const coincideCategoria = categoriaActiva === 'Todas' || p.category === categoriaActiva;
    const coincideBusqueda = p.name.toLowerCase().includes(search.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  // FILTRO ESTRICTO: Le exigimos que sea exactamente "true"
  const productosDestacados = productos.filter(p => p.featured === true);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF9980]"></div>
        <p className="text-[#FF9980] font-bold mt-4 animate-pulse">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col font-sans text-gray-100">
      <Navbar />

      {/* HERO BANNER - SECCIÓN VISUAL PRINCIPAL RESTAURADA */}
      <div className="relative bg-gray-900 border-b border-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF9980]/20 to-purple-900/20 opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 relative z-10 flex flex-col items-center text-center">
          <span className="bg-[#FF9980]/10 text-[#FF9980] border border-[#FF9980]/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            Envíos a todo el país
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight">
            Todo lo que buscás, <br className="hidden sm:block" />
            <span className="text-[#FF9980]">en un solo lugar.</span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Explorá nuestro catálogo completo con los mejores precios en tecnología, bazar, juguetería y mucho más.
          </p>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto w-full p-4 sm:p-8 -mt-8 relative z-20">

        {/* BUSCADOR Y CATEGORÍAS REDISEÑADOS */}
        <div className="bg-gray-800 p-4 sm:p-6 rounded-3xl border border-gray-700 shadow-2xl mb-12 animate-fade-in">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <input
              type="text"
              placeholder="¿Qué estás buscando hoy?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#FF9980]/50 focus:border-[#FF9980] transition-all shadow-inner text-lg"
            />
          </div>

          <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className={`whitespace-nowrap px-6 py-3 rounded-xl font-bold text-sm transition-all flex-shrink-0 ${
                  categoriaActiva === cat
                    ? 'bg-[#FF9980] text-gray-900 shadow-lg shadow-[#FF9980]/20 transform -translate-y-1'
                    : 'bg-gray-900 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* SECCIÓN DESTACADOS */}
        {productosDestacados.length > 0 && search === '' && categoriaActiva === 'Todas' && (
          <div className="mb-16 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                <span className="bg-yellow-500/20 text-yellow-500 w-10 h-10 rounded-full flex items-center justify-center text-xl">⭐</span>
                Productos Destacados
              </h2>
            </div>
            {/* Contenedor con borde y fondo sutil para resaltar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-gradient-to-b from-[#FF9980]/5 to-transparent p-6 sm:p-8 rounded-3xl border border-[#FF9980]/20 shadow-[0_0_30px_rgba(255,153,128,0.05)]">
              {productosDestacados.map(product => (
                <ProductCard key={`destacado-${product.id}`} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* CATÁLOGO GENERAL */}
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
            <h2 className="text-2xl font-black text-gray-200">
              {categoriaActiva === 'Todas'
                ? (search ? 'Resultados de Búsqueda' : 'Catálogo Completo')
                : `Explorando: ${categoriaActiva}`}
            </h2>
            <span className="text-gray-500 font-bold text-sm bg-gray-800 px-3 py-1 rounded-full">
              {productosFiltrados.length} productos
            </span>
          </div>

          {productosFiltrados.length === 0 ? (
            <div className="text-center py-24 bg-gray-900 rounded-3xl border border-gray-800 shadow-xl">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">🔍</span>
              </div>
              <h3 className="text-2xl font-black text-white mb-3">¡Ups! No encontramos nada</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                No pudimos encontrar ningún producto que coincida con tu búsqueda o categoría.
              </p>
              <button
                onClick={() => { setSearch(''); setCategoriaActiva('Todas'); }}
                className="bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black px-8 py-3 rounded-xl transition-transform transform hover:-translate-y-1"
              >
                Ver todo el catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productosFiltrados.map(product => (
                <ProductCard key={`catalogo-${product.id}`} product={product} />
              ))}
            </div>
          )}
        </div>

      </main>

      <WhatsAppButton />
      <Footer />
    </div>
  );
}