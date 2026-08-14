'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { cart } = useCart();
  const [mounted, setMounted] = useState(false);

  // Evitamos errores de hidratación en Next.js esperando a que el componente cargue
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculamos la cantidad total de artículos en el carrito
  const totalItems = cart.reduce((acc, item) => acc + Number(item.quantity || 1), 0);

  return (
    <nav className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo / Link al Inicio */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="group flex items-center gap-2">
              <span className="text-3xl transition-transform group-hover:scale-110">🏪</span>
              <span className="font-black text-2xl tracking-tight text-gray-100 group-hover:text-[#FF9980] transition-colors">
                Polirubro<span className="text-[#FF9980]">Online</span>
              </span>
            </Link>
          </div>

          {/* Menú de la derecha (Carrito) */}
          <div className="flex items-center gap-6">
            <Link 
              href="/cart" 
              className="relative p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors border border-gray-700 hover:border-[#FF9980] group"
              title="Ver mi carrito"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 group-hover:text-[#FF9980] transition-colors">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              
              {/* Burbuja contadora de productos */}
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg animate-bounce-short border-2 border-gray-900">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}