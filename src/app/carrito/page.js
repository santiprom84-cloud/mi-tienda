'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculamos el total sumando el precio * cantidad de cada producto
  const total = cart ? cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) : 0;

  const handleCheckout = () => {
    setIsProcessing(true);
    // Este alert es temporal. En el próximo paso conectamos la pasarela de pago real.
    alert("¡Excelente! El carrito está listo. En el próximo paso conectamos el flujo de Mercado Pago.");
    setIsProcessing(false);
  };

  // PANTALLA: CARRITO VACÍO
  if (!cart || cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-8 mt-10 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <span className="text-7xl mb-6">🛒</span>
        <h1 className="text-4xl font-black text-gray-100 mb-4">Tu carrito está vacío</h1>
        <p className="text-gray-400 mb-8 text-lg">¡Aún no agregaste nada! Tenemos miles de productos esperándote.</p>
        <Link href="/" className="bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black px-8 py-4 rounded-xl transition-all shadow-lg transform hover:-translate-y-1">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  // PANTALLA: CARRITO CON PRODUCTOS
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 mt-4 mb-20">
      <h1 className="text-4xl font-black text-gray-100 mb-8 flex items-center gap-3">
        <span>🛒</span> Tu Carrito
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Lista de productos */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-gray-800 p-4 sm:p-6 rounded-3xl border border-gray-700 shadow-xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative group">
              
              {/* Imagen del producto */}
              <img src={item.image} alt={item.name} className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-2xl border border-gray-700 bg-gray-900" />
              
              {/* Detalles del producto */}
              <div className="flex-grow text-center sm:text-left w-full">
                <h3 className="text-xl font-bold text-gray-100 mb-1 line-clamp-2">{item.name}</h3>
                <p className="text-[#FF9980] font-black text-lg mb-4">${item.price.toLocaleString('es-AR')}</p>
                
                <div className="flex items-center justify-center sm:justify-start gap-4">
                  {/* Controles de cantidad (+ / -) */}
                  <div className="flex items-center bg-gray-900 rounded-lg border border-gray-700 overflow-hidden shadow-inner">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-4 py-1.5 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 font-bold text-gray-100 border-x border-gray-700 min-w-[3rem] text-center">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-4 py-1.5 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Botón eliminar (tacho de basura) */}
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-300 p-2.5 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors flex items-center justify-center"
                    title="Eliminar producto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </div>
              </div>
              
              {/* Subtotal por ítem (Solo visible en pantallas medianas o grandes) */}
              <div className="hidden sm:flex flex-col items-end min-w-[120px]">
                <span className="text-gray-500 text-sm mb-1 font-bold">Subtotal</span>
                <span className="text-2xl font-black text-white">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* COLUMNA DERECHA: Resumen de compra */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 p-6 sm:p-8 rounded-3xl border border-[#FF9980]/30 shadow-2xl sticky top-28">
            <h2 className="text-2xl font-black text-gray-100 mb-6 border-b border-gray-700 pb-4">Resumen</h2>
            
            <div className="flex justify-between items-center mb-4 text-gray-300">
              <span className="font-bold">Productos ({cart.reduce((acc, item) => acc + item.quantity, 0)})</span>
              <span>${total.toLocaleString('es-AR')}</span>
            </div>
            
            <div className="flex justify-between items-center mb-6 text-gray-300">
              <span className="font-bold">Envío</span>
              <span className="text-[#FF9980] font-bold">A coordinar</span>
            </div>

            <div className="flex justify-between items-center mb-8 pt-4 border-t border-gray-700">
              <span className="text-xl font-bold text-white">Total a pagar</span>
              <span className="text-3xl font-black text-[#FF9980]">${total.toLocaleString('es-AR')}</span>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-4 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none flex justify-center items-center gap-2"
            >
              {isProcessing ? 'Procesando...' : (
                <>
                  <span>Proceder al pago</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </>
              )}
            </button>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400 font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF9980]"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Pago 100% seguro
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}