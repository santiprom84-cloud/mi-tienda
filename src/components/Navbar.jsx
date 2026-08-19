'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { cart } = useCart();

  // Calculamos la cantidad de productos en el carrito para la burbujita
  const totalItems = cart ? cart.reduce((total, item) => total + (item.quantity || 1), 0) : 0;

  // ATENCIÓN: Reemplazá este link por la dirección real de tu Instagram
  const instagramUrl = "https://www.instagram.com/polirubroonline.cba?igsh=MTN5ZG9qZDc5dTBnOA%3D%3D&utm_source=qr";

  return (
    <nav className="sticky top-0 z-50 bg-[#FF9980] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO IZQUIERDA - Estilo original restaurado */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🏪</span>
            <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter">
              Polirubro<span className="text-white">Online</span>
            </span>
          </Link>

          {/* MENÚ DERECHA (Instagram + Carrito) */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* BOTÓN INSTAGRAM - Mismo estilo que el carrito */}
            <a 
              href={instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-900 text-white p-2.5 sm:p-3 rounded-full hover:bg-gray-800 transition-transform transform hover:scale-105 flex items-center justify-center shadow-sm"
              title="Seguinos en Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            {/* BOTÓN CARRITO - Estilo original restaurado */}
            <Link href="/carrito" className="relative bg-gray-900 text-white p-2.5 sm:p-3 rounded-full hover:bg-gray-800 transition-transform transform hover:scale-105 flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {/* Burbuja contadora de productos (ahora blanca para que resalte) */}
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-gray-900 text-xs font-black rounded-full h-5 w-5 flex items-center justify-center shadow-md">
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