'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

// ATENCIÓN: Eliminamos la importación del Navbar y el Footer porque ya están en layout.js (esto causaba que se vean dobles)

export default function HomePage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [search, setSearch] = useState('');
  const [orden, setOrden] = useState('Novedades');
  
  // Nuevo estado para controlar si el menú de tres rayitas está abierto
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

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

  // Filtrar los destacados
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

        {/* BARRA DE BÚSQUEDA REDISEÑADA (Todo en una sola línea) */}
        <div className="bg-[#1A1D24] rounded-2xl p-3 mb-10 shadow-lg relative z-40">
          <div className="flex items-center gap-3">
            
            {/* 1. MENÚ DE TRES RAYITAS (CATEGORÍAS) */}
            <div className="relative">
              <button 
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-colors ${isCategoryMenuOpen ? 'bg-[#FF9980] text-gray-900' : 'bg-[#0B0D14] text-gray-400 hover:text-white'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>

              {/* MENÚ DESPLEGABLE DE CATEGORÍAS */}
              {isCategoryMenuOpen && (
                <div className="absolute top-14 left-0 w-56 bg-[#1A1D24] border border-gray-800 rounded-xl shadow-2xl py-2 flex flex-col z-50">
                  <span className="text-gray-500 text-[10px] font-black uppercase px-4 mb-2">Categorías</span>
                  {categorias.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => {
                        setCategoriaActiva(cat);
                        setIsCategoryMenuOpen(false);
                      }}
                      className={`text-left px-4 py-2.5 text-sm font-bold transition-colors ${
                        categoriaActiva === cat 
                        ? 'bg-[#FF9980]/10 text-[#FF9980] border-l-2 border-[#FF9980]' 
                        : 'text-gray-400 hover:bg-[#0B0D14] hover:text-white border-l-2 border-transparent'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. INPUT DE BÚSQUEDA */}
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

            {/* 3. SELECTOR DE FILTRO / ORDEN */}
            <div className="shrink-0 flex items-center h-12 bg-[#0B0D14] rounded-xl px-3 border border-gray-800 cursor-pointer">
              <span className="text-gray-500 text-[10px] font-black uppercase mr-2 hidden sm:block">Filtro:</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-2 sm:hidden"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              <select 
                value={orden} 
                onChange={(e) => setOrden(e.target.value)}
                className="bg-transparent text-gray-300 text-sm font-bold focus:outline-none cursor-pointer appearance-none pr-4"
              >
                <option value="Novedades">Novedades</option>
                <option value="Menor Precio">Menor Precio</option>
                <option value="Mayor Precio">Mayor Precio</option>
              </select>
            </div>

          </div>
        </div>

        {/* SECCIÓN: PRODUCTOS DESTACADOS */}
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

        {/* CATÁLOGO GENERAL */}
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
              <button 
                onClick={() => { setSearch(''); setCategoriaActiva('Todas'); }}
                className="mt-6 bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black px-6 py-2 rounded-xl transition-transform transform hover:-translate-y-1"
              >
                Ver todo el catálogo
              </button>
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

    </div>
  );
}