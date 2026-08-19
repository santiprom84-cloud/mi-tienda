'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext'; // <-- Traemos el usuario

export default function Navbar() {
  const { cart } = useCart();
  const { user } = useAuth(); // Saber si está logueado o no

  const totalItems = cart ? cart.reduce((total, item) => total + (item.quantity || 1), 0) : 0;
  const instagramUrl = "https://instagram.com/tu_usuario_aca";

  return (
    <nav className="sticky top-0 z-50 bg-[#FF9980] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center h-20">
          
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🏪</span>
            <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter">
              Polirubro<span className="text-white">Online</span>
            </span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            
            <a 
              href={instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-900 hover:text-[#E1306C] transition-all transform hover:scale-105 flex items-center gap-2 group hidden sm:flex"
              title="Seguinos en Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:drop-shadow-[0_0_8px_rgba(225,48,108,0.5)]">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span className="font-bold text-sm tracking-wide group-hover:text-[#E1306C] transition-colors">
                Seguinos
              </span>
            </a>

            <div className="h-8 w-px bg-gray-900/20 hidden sm:block"></div>

            {/* BOTÓN USUARIO / LOGIN */}
            <Link 
              href={user ? "/perfil" : "/login"} 
              className="bg-gray-900 text-white p-2.5 sm:p-3 rounded-full hover:bg-gray-800 transition-transform transform hover:scale-105 flex items-center justify-center shadow-sm relative group"
              title={user ? "Mi Perfil" : "Iniciar Sesión"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {/* Puntito verde si está conectado */}
              {user && (
                <span className="absolute 0 top-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></span>
              )}
            </Link>

            {/* BOTÓN CARRITO */}
            <Link href="/carrito" className="relative bg-gray-900 text-white p-2.5 sm:p-3 rounded-full hover:bg-gray-800 transition-transform transform hover:scale-105 flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-gray-900 text-xs font-black rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-bounce">
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