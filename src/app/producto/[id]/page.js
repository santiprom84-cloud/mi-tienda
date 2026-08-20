'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error("Error al buscar el producto:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF9980]"></div>
        <p className="text-[#FF9980] font-bold mt-4 animate-pulse">Buscando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <span className="text-6xl mb-4">🛒</span>
        <h1 className="text-2xl font-bold text-gray-100">Producto no encontrado</h1>
        <p className="text-gray-400 mt-2">El artículo que buscás no existe o fue eliminado.</p>
        <Link href="/" className="mt-6 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 mt-4 mb-20">
      
      {/* Barra de Navegación / Migas de pan */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-400 font-bold">
        <button onClick={() => router.back()} className="hover:text-[#FF9980] transition-colors flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Volver
        </button>
        <span>/</span>
        <span className="text-gray-500 cursor-default">{product.category || 'Catálogo'}</span>
      </div>

      <div className="bg-gray-800 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* Lado Izquierdo: Imagen del Producto */}
        <div className="w-full lg:w-1/2 bg-gray-900 relative">
          <div className="aspect-square w-full h-full relative">
            <img 
              src={product.image || 'https://via.placeholder.com/600?text=Sin+Imagen'} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            {product.category && (
              <span className="absolute top-4 left-4 z-10 bg-gray-900/80 backdrop-blur-sm text-gray-200 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg border border-gray-700 shadow-lg">
                {product.category}
              </span>
            )}
          </div>
        </div>

        {/* Lado Derecho: Detalles y Compra */}
        <div className="w-full lg:w-1/2 p-6 sm:p-12 flex flex-col justify-center">
          
          <h1 className="text-2xl sm:text-4xl font-black text-gray-100 mb-4 leading-tight">
            {product.name}
          </h1>
          
          <div className="mb-8">
            <p className="text-3xl sm:text-5xl font-black text-[#FF9980]">
              ${Number(product.price).toLocaleString('es-AR')}
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50 mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Descripción del producto</h3>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
              {product.description || "Este producto no tiene una descripción detallada cargada en el sistema. Para más información o consultas sobre especificaciones técnicas, no dudes en contactarnos."}
            </p>
          </div>

          {/* Selector de Cantidad y Botón de Compra */}
          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            
            <div className="flex items-center bg-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-inner h-14 sm:w-1/3">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                className="px-5 h-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                -
              </button>
              <span className="flex-grow font-black text-gray-100 text-center text-lg">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)} 
                className="px-5 h-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                +
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              className="flex-grow bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black h-14 rounded-xl text-lg transition-transform transform active:scale-95 flex items-center justify-center gap-3 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              Sumar al Carrito
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-gray-500 uppercase justify-center sm:justify-start">
            <span className="flex items-center gap-1.5"><span className="text-green-500 text-base">✓</span> Stock Disponible</span>
            <span className="flex items-center gap-1.5"><span className="text-blue-500 text-base">🛡️</span> Compra Segura</span>
          </div>

        </div>
      </div>

      {/* Notificación Toast */}
      {addedToast && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-11/12 max-w-sm bg-[#25D366] text-gray-900 px-6 py-4 rounded-2xl shadow-2xl font-black text-sm flex items-center justify-center gap-3 z-50 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <span className="truncate flex-grow text-center">¡Agregaste {quantity} al carrito!</span>
        </div>
      )}

    </div>
  );
}