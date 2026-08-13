"use client";

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  // Traemos la función para abrir el carrito
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        <Link href="/" className="font-extrabold text-2xl text-slate-900 tracking-tight transition-transform hover:scale-105">
          DevTienda<span className="text-blue-600">.</span>
        </Link>

        {/* Agregamos el evento onClick para abrir el panel */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
          
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-blue-600 rounded-full border-2 border-white transform translate-x-1/4 -translate-y-1/4">
              {cartCount}
            </span>
          )}
        </button>

      </div>
    </nav>
  );
}