'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { cart } = useCart();
  const { user, loadingAuth, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const totalItems = cart ? cart.reduce((total, item) => total + (item.quantity || 1), 0) : 0;
  const instagramUrl = "https://instagram.com/polirubroonline.cba";

  const isAdmin = user?.email === 'santiprom84@gmail.com';
  const isHome = pathname === '/';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-[#FF9980] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center h-20">
          
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
            <span className="text-xl sm:text-2xl">🏪</span>
            <span className="text-lg sm:text-3xl font-black text-gray-900 tracking-tighter truncate">
              Polirubro<span className="text-white">Online</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            
            <a 
              href={instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-900 hover:text-[#E1306C] transition-all transform hover:scale-105 flex items-center gap-2 group hidden lg:flex"
              title="Seguinos en Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:drop-shadow-[0_0_8px_rgba(225,48,108,0.5)]">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span className="font-bold text-sm tracking-wide group-hover:text-[#E1306C] transition-colors">
                Seguinos
              </span>
            </a>

            <div className="h-8 w-px bg-gray-900/20 hidden lg:block mx-1"></div>

            {!isHome && (
              <Link 
                href="/" 
                className="bg-gray-900/10 text-gray-900 hover:bg-gray-900 hover:text-white p-2.5 sm:px-4 sm:py-2.5 rounded-full sm:rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm border border-transparent hover:border-gray-700"
                title="Volver al Inicio"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span className="hidden sm:block font-bold text-sm">Inicio</span>
              </Link>
            )}

            {isAdmin && (
              <Link 
                href="/admin" 
                className="bg-red-600 text-white p-2.5 rounded-full hover:bg-red-700 transition-transform transform hover:scale-105 flex items-center justify-center shadow-sm"
                title="Panel Admin"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              </Link>
            )}

            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => {
                  if (loadingAuth) return;
                  if (user) setIsDropdownOpen(!isDropdownOpen);
                  else router.push('/login');
                }}
                className="bg-gray-900 text-white p-2.5 rounded-full hover:bg-gray-800 transition-transform transform hover:scale-105 flex items-center justify-center shadow-sm relative"
                title={user ? 'Mi cuenta' : 'Iniciar Sesión'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {user && <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></span>}
              </button>

              {user && isDropdownOpen && (
                <div
                  className="absolute right-0 mt-3 w-56 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50"
                  style={{ animation: 'navDropdown 0.15s ease-out' }}
                >
                  {/* Email del usuario */}
                  <div className="px-4 py-3 border-b border-gray-700/80">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Sesión activa</p>
                    <p className="text-gray-200 text-sm font-semibold truncate">{user.email}</p>
                  </div>

                  {/* Mi Perfil */}
                  <Link
                    href="/perfil"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF9980] shrink-0">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span className="text-sm font-semibold">Mi Perfil</span>
                  </Link>

                  {/* Cerrar Sesión */}
                  <button
                    onClick={async () => { setIsDropdownOpen(false); await logout(); router.push('/'); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-red-950/60 hover:text-red-400 transition-colors border-t border-gray-700/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span className="text-sm font-semibold">Cerrar Sesión</span>
                  </button>
                </div>
              )}

              <style jsx>{`
                @keyframes navDropdown {
                  from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                  to   { opacity: 1; transform: translateY(0) scale(1); }
                }
              `}</style>
            </div>

            <Link href="/carrito" className="relative bg-gray-900 text-white p-2.5 rounded-full hover:bg-gray-800 transition-transform transform hover:scale-105 flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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