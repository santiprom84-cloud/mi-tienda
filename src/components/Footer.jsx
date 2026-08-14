export default function Footer() {
  return (
    <footer className="bg-[#FF9980] text-red-900 py-8 mt-12 border-t-4 border-red-600">
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center text-center">
        <h3 className="text-2xl font-black mb-2 text-red-700">Polirubro Online.cba</h3>
        
        <div className="bg-white/40 px-6 py-3 rounded-xl inline-block mb-4 shadow-sm">
          <p className="font-bold text-red-900 text-lg flex items-center justify-center gap-2">
            <span>📍</span> Centro de operaciones en <strong>Córdoba Capital</strong>
          </p>
        </div>
        
        <p className="text-sm md:text-base font-medium text-red-800 max-w-md">
          Somos tu tienda virtual de confianza. Operamos 100% online con logística y despachos desde la capital hacia donde lo necesites.
        </p>
        
        <div className="w-16 h-1 bg-red-600 my-6 rounded-full"></div>
        
        <p className="text-xs font-bold text-red-700">
          © {new Date().getFullYear()} Polirubro Online.cba - Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}