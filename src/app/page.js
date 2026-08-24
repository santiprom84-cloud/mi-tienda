'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function HomePage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [search, setSearch] = useState('');
  const [orden, setOrden] = useState('Novedades');

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

  // Aplicar filtros de categoría y búsqueda
  let productosFiltrados = productos.filter(p => {
    const coincideCategoria = categoriaActiva === 'Todas' || p.category === categoriaActiva;
    const coincideBusqueda = p.name.toLowerCase().includes(search.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  // Aplicar ordenamiento
  if (orden === 'Menor Precio') {
    productosFiltrados.sort((a, b) => a.price - b.price);
  } else if (orden === 'Mayor Precio') {
    productosFiltrados.sort((a, b) => b.price - a.price);
  }

  // Filtrar los destacados (le exigimos que el campo 'featured' sea true)
  const productosDestacados = productos.filter(p => p.featured === true);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D14] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF9980]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D14] flex flex-col font-sans text-gray-100">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto w-full p-4 sm:p-6 mt-6">

        {/* HERO BANNER ORIGINAL */}
        <div className="bg-[#1A1D24] rounded-[2rem] p-8 sm:p-12 mb-8 shadow-xl">
          <span className="bg-[#FF9980]/10 text-[#FF9980] px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6 inline-block">
            Catálogo Online
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
            Todo lo que buscás,<br />
            <span className="text-[#FF9980]">en un solo lugar.</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-md leading-relaxed mt-4">
            Envíos a toda Córdoba Capital. Explorá nuestro catálogo y comprá seguro desde casa.
          </p>
        </div>

        {/* BARRA DE BÚSQUEDA Y FILTROS ORIGINAL */}
        <div className="bg-[#1A1D24] rounded-2xl p-3 mb-10 shadow-lg">
          <div className="flex items-center gap-3">
            <button className="w-12 h-12 shrink-0 bg-[#0B0D14] rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input 
                type="text" 
                placeholder="Buscar productos..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0B0D14] rounded-xl pl-12 pr-4 h-12 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#FF9980] transition-shadow placeholder-gray-600"
              />
            </div>
          </div>

          <div className="mt-3 bg-[#0B0D14] rounded-xl p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
              <span className="text-gray-600 text-[10px] sm:text-xs font-black uppercase ml-2 mr-3 shrink-0">Categoría:</span>
              <div className="flex gap-2">
                {categorias.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setCategoriaActiva(cat)}
                    className={`whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      categoriaActiva === cat 
                      ? 'bg-[#2A2D36] text-[#FF9980]' 
                      : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="shrink-0 flex items-center px-2 sm:px-0 border-t border-gray-800 pt-2 sm:border-0 sm:pt-0">
              <div className="flex items-center bg-[#1A1D24] border border-gray-800 rounded-lg px-3 py-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <select 
                  value={orden} 
                  onChange={(e) => setOrden(e.target.value)}
                  className="bg-transparent text-gray-400 text-xs font-bold focus:outline-none cursor-pointer appearance-none pr-4"
                >
                  <option value="Novedades">Novedades</option>
                  <option value="Menor Precio">Menor Precio</option>
                  <option value="Mayor Precio">Mayor Precio</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* --- NUEVA SECCIÓN: PRODUCTOS DESTACADOS --- */}
        {/* Solo se muestran si no hay filtros de búsqueda aplicados y si existen destacados */}
        {productosDestacados.length > 0 && search === '' && categoriaActiva === 'Todas' && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span className="text-yellow-500">⭐</span> Productos Destacados
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {productosDestacados.map(product => (
                <ProductCard key={`destacado-${product.id}`} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* CATÁLOGO GENERAL (Mismo encabezado que tu captura) */}
        <div className="mb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>🔥</span> {categoriaActiva === 'Todas' ? (search ? 'Resultados' : 'Catálogo Completo') : categoriaActiva}
            </h2>
            <span className="bg-[#1A1D24] text-gray-400 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full border border-gray-800">
              {productosFiltrados.length} productos
            </span>
          </div>

          {productosFiltrados.length === 0 ? (
            <div className="text-center py-20 bg-[#1A1D24] rounded-[2rem]">
              <span className="text-5xl mb-4 block opacity-50">🛒</span>
              <h3 className="text-xl font-bold text-white mb-2">No se encontraron productos</h3>
              <p className="text-gray-500 text-sm">Intentá con otra búsqueda o categoría.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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