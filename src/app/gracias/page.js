'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Componente interno que maneja los parámetros de la URL
function GraciasContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="max-w-2xl mx-auto p-8 text-center mt-10 bg-gray-800 rounded-3xl border border-gray-700 shadow-xl">
      <span className="text-7xl block mb-6">🎉</span>
      <h1 className="text-4xl md:text-5xl font-black text-[#FF9980] mb-4">
        ¡Pago exitoso!
      </h1>
      <p className="text-gray-300 text-lg mb-6">
        Tu compra se procesó correctamente. Ya estamos preparando tu pedido para coordinar la entrega en Córdoba Capital.
      </p>

      {paymentId && (
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 mb-8 inline-block">
          <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">
            Comprobante de Mercado Pago
          </p>
          <p className="text-2xl font-mono text-gray-100 font-black">
            #{paymentId}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link 
          href="/" 
          className="bg-gray-700 hover:bg-gray-600 text-white font-black py-4 px-8 rounded-xl transition-all"
        >
          Volver a la tienda
        </Link>
        
        <a 
          // ACORDATE DE CAMBIAR ESTE NÚMERO POR EL TUYO
          href={`https://wa.me/5493510000000?text=${encodeURIComponent(`¡Hola! Acabo de abonar mi pedido en Polirubro Online. Mi comprobante de Mercado Pago es el #${paymentId || '...'}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] hover:bg-[#1ebe57] text-white font-black py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.245 3.483 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          Avisar por WhatsApp
        </a>
      </div>
    </div>
  );
}

// Componente principal envuelto en Suspense por requerimiento estricto de Next.js
export default function GraciasPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF9980]"></div>
      }>
        <GraciasContent />
      </Suspense>
    </div>
  );
}