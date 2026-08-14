'use client';

import { useState, useEffect, use } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function ProductDetailPage({ params }) {
  // Desempaquetamos los params usando "use()" de React para Next.js 14+
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/productos/${id}`);
        
        // BLINDAJE: Leemos el texto crudo para evitar que explote si Vercel manda HTML
        const textResponse = await response.text();
        
        let data;
        try {
          data = JSON.parse(textResponse);
        } catch (err) {
          console.error("Respuesta cruda del servidor:", textResponse);
          throw new Error("No se encontró la API de búsqueda. Verificá que exista el archivo exacto: src/app/api/productos/[id]/route.js");
        }

        if (!response.ok) {
          throw new Error(data.error || 'No se pudo cargar el producto');
        }

        setProduct(data.producto);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF9980]"></div>
        <p className="text-[#FF9980] font-bold mt-4 animate-pulse">Cargando detalles...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center mt-10 bg-gray-800 rounded-3xl border border-gray-700 shadow-xl">
        <span className="text-6xl block mb-4">📦</span>
        <h1 className="text-3xl font-black text-gray-100 mb-4">Producto no encontrado</h1>
        <p className="text-red-400 mb-8 font-bold">{error || "El artículo que buscás ya no está disponible."}</p>
        <Link href="/" className="bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-3 px-8 rounded-full transition-all">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  const cleanPrice = Number(product.price);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 mt-4">
      {/* Botón de volver */}
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#FF9980] font-bold mb-8 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Volver al catálogo
      </Link>

      <div className="bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col md:flex-row">
        
        {/* Lado izquierdo: Imagen grande */}
        <div className="md:w-1/2 h-80 md:h-auto bg-gray-900 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-6 left-6">
            <span className="bg-gray-900/90 text-[#FF9980] text-sm font-black px-4 py-2 rounded-full uppercase tracking-widest backdrop-blur-md border border-[#FF9980]/30">
              {product.category}
            </span>
          </div>
        </div>

        {/* Lado derecho: Info y compra */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h1 className="text-3xl md:text-5xl font-black text-gray-100 mb-6 leading-tight">
            {product.name}
          </h1>
          
          <div className="mb-8">
            <span className="text-5xl font-black text-[#FF9980]">
              ${cleanPrice.toLocaleString('es-AR')}
            </span>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700 mb-8">
            <h3 className="text-gray-300 font-bold uppercase tracking-wider text-sm mb-3">Descripción del producto</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          <button 
            onClick={() => addToCart(product)}
            className="w-full bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black text-xl py-5 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}