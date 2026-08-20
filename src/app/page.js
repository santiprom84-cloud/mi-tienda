'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedToast, setAddedToast] = useState(null); // Para mostrar un mensajito cuando agrega al carrito

  // Buscamos los productos en la base de datos (o usamos de prueba si no hay)
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Intentamos traer productos de la tabla 'productos'
      const { data, error } = await supabase.from('productos').select('*');
      
      if (error) throw error;

      if (data && data.length > 0) {
        setProducts(data);
      } else {
        // Si la tabla está vacía, ponemos productos de prueba hermosos para ver el diseño
        setProducts([
          { id: '1', name: 'Auriculares Inalámbricos Bluetooth 5.0 con Cancelación de Ruido', price: 25500, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', category: 'Tecnología' },
          { id: '2', name: 'Reloj Inteligente Smartwatch Deportivo Ritmo Cardíaco', price: 32000, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', category: 'Accesorios' },
          { id: '3', name: 'Termo de Acero Inoxidable 1 Litro Doble Capa Frío/Calor', price: 18900, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80', category: 'Bazar' },
          { id: '4', name: 'Mochila Urbana Impermeable Porta Notebook 15.6"', price: 21000, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80', category: 'Indumentaria' },
          { id: '5', name: 'Teclado Mecánico Gamer Switch Blue RGB Luces', price: 45000, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80', category: 'Gaming' },
          { id: '6', name: 'Set de Mate Completo: Mate Pampa + Bombilla + Yerbera', price: 15500, image: 'https://images.unsplash.com/photo-1620063200690-062e74da6059?w=500&q=80', category: 'Bazar' },
        ]);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedToast(product.name);
    setTimeout(() => setAddedToast(null), 3000); // El cartelito desaparece a los 3 segundos
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 mt-4 mb-20">
      
      {/* Banner Principal Responsivo */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-6 sm:p-12 mb-8 sm:mb-12 border border-gray-700 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#FF9980] rounded-full blur-[100px] opacity-20"></div>
        
        <div className="relative z-10 text-center sm:text-left">
          <span className="bg-[#FF9980]/20 text-[#FF9980] px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block border border-[#FF9980]/30">
            Novedades
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Todo lo que buscás, <br className="hidden sm:block" />
            <span className="text-[#FF9980]">en un solo lugar.</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto sm:mx-0">
            Envíos a toda Córdoba Capital. Tecnología, bazar, accesorios y mucho más al mejor precio.
          </p>
        </div>
      </div>

      {/* Título del Catálogo */}
      <div className="flex justify-between items-end mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
          <span>🔥</span> Catálogo Destacado
        </h2>
      </div>

      {/* GRILLA DE PRODUCTOS - ACÁ ESTÁ LA MAGIA PARA CELULARES */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#FF9980]"></div>
          <p className="text-gray-400 font-bold mt-4">Cargando productos...</p>
        </div>
      ) : (
        /* 
          Explicación de la grilla:
          grid-cols-2: 2 columnas en celulares (por defecto).
          sm:grid-cols-3: 3 columnas en tablets.
          lg:grid-cols-4: 4 columnas en PC.
          gap-3 sm:gap-6: Espacio entre tarjetas más chico en celular, más grande en PC.
        */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-700 shadow-lg overflow-hidden flex flex-col hover:border-[#FF9980]/50 transition-all group"
            >
              {/* Imagen del Producto (Cuadrada) */}
              <div className="relative aspect-square w-full bg-gray-900 overflow-hidden">
                {product.category && (
                  <span className="absolute top-2 left-2 z-10 bg-gray-900/80 backdrop-blur-sm text-gray-200 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md border border-gray-700">
                    {product.category}
                  </span>
                )}
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Contenido de la Tarjeta (Textos y botón ajustados para celular) */}
              <div className="p-3 sm:p-5 flex flex-col flex-grow">
                {/* Título de 2 líneas fijas para que las tarjetas midan lo mismo */}
                <h3 className="text-xs sm:text-base font-bold text-gray-100 line-clamp-2 mb-1 sm:mb-2 h-8 sm:h-12" title={product.name}>
                  {product.name}
                </h3>
                
                {/* Precio */}
                <div className="mt-auto">
                  <p className="text-lg sm:text-2xl font-black text-[#FF9980] mb-3 sm:mb-4">
                    ${product.price.toLocaleString('es-AR')}
                  </p>
                  
                  {/* Botón de Agregar */}
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

      {/* Toast (Notificación) cuando se agrega un producto */}
      {addedToast && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm sm:text-base flex items-center gap-3 z-50 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <span className="truncate max-w-[200px] sm:max-w-xs">{addedToast} agregado</span>
        </div>
      )}

    </div>
  );
}