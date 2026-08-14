'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useState } from 'react';

export default function CartPage() {
  const { cart, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);

  // Calculamos el total sumando el precio de cada producto por su cantidad
  const total = cart.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity || 1)), 0);

  // Función para enviar los productos a nuestra API de Mercado Pago
  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cart }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al conectar con Mercado Pago');
      }

      // Si todo sale bien, redirigimos a la pasarela de pago oficial
      window.location.href = data.url;
    } catch (error) {
      console.error("Error en checkout:", error);
      alert("Hubo un error al iniciar el pago. Por favor, intentá de nuevo.");
      setLoading(false);
    }
  };

  // Si el carrito está vacío, mostramos este mensaje
  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center mt-10">
        <h1 className="text-4xl font-black text-red-700 mb-6 drop-shadow-sm">Tu Carrito</h1>
        <div className="bg-white p-12 rounded-3xl shadow-lg border-2 border-red-100">
          <span className="text-6xl block mb-4">🛒</span>
          <p className="text-2xl text-red-900 mb-8 font-bold">El carrito está vacío.</p>
          <Link href="/" className="bg-red-600 hover:bg-red-700 text-white font-black py-4 px-10 rounded-full shadow-md transition-all inline-block transform hover:scale-105">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  // Si hay productos, mostramos la lista y el total
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 mt-6">
      <h1 className="text-3xl md:text-4xl font-black text-red-700 mb-8 border-b-4 border-red-200 pb-4">Tu Carrito</h1>
      
      <div className="bg-white rounded-3xl shadow-xl border-2 border-red-100 overflow-hidden">
        <ul className="divide-y-2 divide-red-50">
          {cart.map((item, index) => (
            <li key={index} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-red-50/30 transition-colors">
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-black text-red-900">{item.name}</h2>
                <p className="text-red-700 font-bold mt-1 bg-red-100 inline-block px-3 py-1 rounded-full text-sm">
                  Cantidad: {item.quantity || 1}
                </p>
              </div>
              <div className="flex items-center gap-6 mt-4 sm:mt-0">
                <span className="text-3xl font-black text-gray-800">
                  ${Number(item.price).toLocaleString('es-AR')}
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
          ))}
        </ul>
        
        {/* Sección de Total y Pagar */}
        <div className="bg-red-50 p-6 sm:p-10 border-t-2 border-red-100 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="text-center sm:text-left">
            <p className="text-red-800 font-bold text-xl mb-1 uppercase tracking-wider">Total a pagar</p>
            <p className="text-5xl font-black text-red-700 drop-shadow-sm">
              ${total.toLocaleString('es-AR')}
            </p>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-black text-xl py-5 px-12 rounded-full shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center"
          >
            {loading ? 'Conectando...' : 'Pagar ahora'}
          </button>
        </div>
      </div>
    </div>
  );
}