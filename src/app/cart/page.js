'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useState } from 'react';

export default function CartPage() {
  const { cart, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Calculamos el total limpiando puntos de los miles
  const total = cart.reduce((acc, item) => {
    const cleanPrice = Number(String(item.price).replace(/\./g, '').replace(',', '.'));
    return acc + (cleanPrice * Number(item.quantity || 1));
  }, 0);

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMessage(null); // Limpiamos errores previos
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Lanzamos el error para mostrarlo en pantalla
        throw new Error(data.details?.message || data.error || 'Error de conexión');
      }

      // ¡A la pasarela de pagos!
      window.location.href = data.url;
    } catch (error) {
      console.error("Fallo al cobrar:", error);
      setErrorMessage(error.message); // Lo mostramos en la UI
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center mt-10">
        <h1 className="text-4xl font-black text-[#FF9980] mb-6 drop-shadow-sm">Tu Carrito</h1>
        <div className="bg-gray-800 p-12 rounded-3xl shadow-lg border border-gray-700">
          <span className="text-6xl block mb-4">🛒</span>
          <p className="text-2xl text-gray-300 mb-8 font-bold">El carrito está vacío.</p>
          <Link href="/" className="bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-4 px-10 rounded-full shadow-md transition-all inline-block transform hover:scale-105">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 mt-6">
      <h1 className="text-3xl md:text-4xl font-black text-[#FF9980] mb-8 border-b border-gray-700 pb-4">Tu Carrito</h1>
      
      <div className="bg-gray-800 rounded-3xl shadow-xl border border-gray-700 overflow-hidden">
        <ul className="divide-y divide-gray-700">
          {cart.map((item, index) => {
            const cleanPrice = Number(String(item.price).replace(/\./g, '').replace(',', '.'));
            return (
              <li key={index} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-gray-750 transition-colors">
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-black text-gray-100">{item.name}</h2>
                  <p className="text-gray-900 font-bold mt-2 bg-[#FF9980] inline-block px-3 py-1 rounded-full text-sm">
                    Cantidad: {item.quantity || 1}
                  </p>
                </div>
                <div className="flex items-center gap-6 mt-4 sm:mt-0">
                  <span className="text-3xl font-black text-gray-100">
                    ${cleanPrice.toLocaleString('es-AR')}
                  </span>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-white font-bold bg-red-500 hover:bg-red-600 p-3 rounded-xl transition-colors shadow-sm"
                    title="Eliminar producto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        
        {/* PANEL DE ERROR: Si falla Mercado Pago, te va a avisar exactamente por qué */}
        {errorMessage && (
          <div className="bg-red-900/40 border-l-4 border-red-500 p-5 m-6 rounded-md">
            <h3 className="text-red-300 font-black flex items-center gap-2 text-lg">
              <span>⚠️</span> Error al procesar el pago
            </h3>
            <p className="text-red-200 mt-2 font-mono text-sm">{errorMessage}</p>
            <p className="text-gray-400 text-xs mt-3">
              💡 Tip: Verificá en Vercel que el token esté correcto y no te olvides de hacer un "Redeploy".
            </p>
          </div>
        )}

        <div className="bg-gray-900 p-6 sm:p-10 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="text-center sm:text-left">
            <p className="text-gray-400 font-bold text-xl mb-1 uppercase tracking-wider">Total a pagar</p>
            <p className="text-5xl font-black text-[#FF9980] drop-shadow-sm">
              ${total.toLocaleString('es-AR')}
            </p>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="w-full sm:w-auto bg-[#FF9980] hover:bg-[#ff8060] disabled:bg-gray-600 text-gray-900 font-black text-xl py-5 px-12 rounded-full shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center"
          >
            {loading ? 'Conectando...' : 'Pagar ahora'}
          </button>
        </div>
      </div>
    </div>
  );
}