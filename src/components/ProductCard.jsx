'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  // Limpiamos el precio por si viene como texto o con decimales
  const cleanPrice = Number(product.price);

  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700 hover:border-[#FF9980] transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full group">
      {/* Imagen clickeable que lleva al detalle */}
      <Link href={`/producto/${product.id}`} className="h-36 sm:h-56 overflow-hidden relative block cursor-pointer">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <span className="bg-gray-900/80 text-[#FF9980] text-[9px] sm:text-xs font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider backdrop-blur-sm border border-[#FF9980]/30">
            {product.category}
          </span>
        </div>
      </Link>

      {/* Detalles del producto */}
      <div className="p-3 sm:p-5 flex flex-col flex-grow">
        <Link href={`/producto/${product.id}`} className="hover:text-[#FF9980] transition-colors cursor-pointer">
          <h3 className="text-base sm:text-xl font-black text-gray-100 mb-1 sm:mb-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 flex-grow">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-3 sm:pt-4 border-t border-gray-700">
          <span className="text-lg sm:text-2xl font-black text-[#FF9980]">
            ${cleanPrice.toLocaleString('es-AR')}
          </span>
          <button 
            onClick={() => addToCart(product)}
            className="bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-2 px-3 sm:px-4 rounded-xl shadow-md transition-colors flex items-center gap-1.5 sm:gap-2 z-10 min-h-[40px]"
            title="Agregar al carrito"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
}