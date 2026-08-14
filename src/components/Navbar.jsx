'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { cart } = useCart();
  const [mounted, setMounted] = useState(false);

  // Evitamos errores de hidratación en Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + Number(item.quantity || 1), 0);

  return (
    // Aplicamos el fondo salmón (#FF9980) a toda la barra
    <nav className="bg-[#FF9980] border-b border-[#ff8060] sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo / Link al Inicio */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="group flex items-center gap-2">
              <span className="text-3xl transition-transform group-hover:scale-110">🏪</span>
              <span className="font-black text-2xl tracking-tight text-gray-900">
                Polirubro<span className="text-white">Online</span>
              </span>
            </Link>
          </div>

          {/* Menú de la derecha (Ubicación y Carrito) */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Ubicación: Visible en pantallas medianas y grandes */}
            <div className="hidden sm:flex items-center gap-2 bg-white/30 px-4 py-2 rounded-full border border-white/40 text-gray-900 font-black text-sm shadow-sm">
              <span>📍</span>
              <span>Córdoba Capital</span>
            </div>

            <Link 
              href="/cart" 
              className="relative p-3 bg-gray-900 hover:bg-gray-800 rounded-full transition-all border-2 border-gray-900 hover:border-white shadow-lg group transform hover:scale-105"
              title="Ver mi carrito"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF9980] transition-colors">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              
              {/* Burbuja contadora de productos con animación constante (animate-bounce) */}
              {mounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-black w-7 h-7 flex items-center justify-center rounded-full shadow-xl animate-bounce border-2 border-gray-900">
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