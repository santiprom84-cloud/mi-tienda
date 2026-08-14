import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="bg-[#FF9980] shadow-md p-4 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-3">
        {/* Asegurate de tener tu logo.png en la carpeta public */}
        <Image 
          src="/logo.png" 
          alt="Logo Polirubro Online.cba" 
          width={45} 
          height={45} 
          className="object-contain bg-white rounded-full p-1"
        />
        <span className="text-2xl font-black text-red-700 tracking-tight">
          Polirubro Online.cba
        </span>
      </Link>
      
      <div className="flex items-center gap-4 sm:gap-6">
        <span className="hidden sm:flex items-center gap-1 text-red-900 font-bold text-sm bg-white/30 px-3 py-1 rounded-full">
          📍 Córdoba Capital
        </span>
        <Link href="/" className="text-red-800 hover:text-red-600 font-bold transition-colors">
          Inicio
        </Link>
      </div>
    </nav>
  );
}