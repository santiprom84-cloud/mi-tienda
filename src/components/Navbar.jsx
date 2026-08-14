import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-[#FF9980] shadow-md p-4 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center">
        {/* Título todo junto y sin la imagen */}
        <span className="text-2xl md:text-3xl font-black text-red-700 tracking-tight">
          Polirubroonline.com.ar
        </span>
      </Link>
      
      <div className="flex items-center gap-4 sm:gap-6">
        <span className="hidden sm:flex items-center gap-1 text-red-900 font-bold text-sm bg-white/30 px-3 py-1 rounded-full">
          📍 Córdoba Capital
        </span>
        <Link href="/" className="hidden sm:block text-red-800 hover:text-red-600 font-bold transition-colors">
          Inicio
        </Link>
        {/* Restauramos el botón del Carrito de compras */}
        <Link href="/cart" className="text-red-900 hover:bg-white/40 font-bold flex items-center gap-2 bg-white/30 px-3 py-2 rounded-lg transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span className="hidden sm:block">Carrito</span>
        </Link>
      </div>
    </nav>
  );
}