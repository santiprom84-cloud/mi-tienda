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
    <nav className="sticky top-0 z-50 bg-gray-900 border-b border-[#FF9980]/30 shadow-lg backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO IZQUIERDA */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-3xl font-black text-white tracking-tighter group-hover:text-[#FF9980] transition-colors">
              Polirubro<span className="text-[#FF9980] group-hover:text-white transition-colors">Online</span>
            </span>
          </Link>

          {/* MENÚ DERECHA (Instagram + Carrito) */}
          <div className="flex items-center gap-5 sm:gap-6">
            
            {/* BOTÓN INSTAGRAM */}
            <a 
              href={instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#E1306C] transition-all transform hover:scale-110 flex items-center gap-2 group"
              title="Seguinos en Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:drop-shadow-[0_0_8px_rgba(225,48,108,0.5)]">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span className="hidden sm:block font-bold text-sm tracking-wide">Seguinos</span>
            </a>

            {/* SEPARADOR VISUAL */}
            <div className="h-8 w-px bg-gray-700 hidden sm:block"></div>

            {/* BOTÓN CARRITO */}
            <Link href="/carrito" className="relative text-gray-300 hover:text-[#FF9980] transition-all transform hover:scale-110 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {/* Burbuja contadora de productos */}
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FF9980] text-gray-900 text-xs font-black rounded-full h-6 w-6 flex items-center justify-center shadow-md animate-bounce">
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