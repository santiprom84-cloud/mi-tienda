'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useState } from 'react';

export default function CartPage() {
  const { cart, removeFromCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculamos el total limpiando puntos de los miles
  const total = cart.reduce((acc, item) => {
    const cleanPrice = Number(String(item.price).replace(/\./g, '').replace(',', '.'));
    return acc + (cleanPrice * Number(item.quantity || 1));
  }, 0);

  const handleWhatsAppCheckout = async () => {
    // 1. Validamos que el cliente haya puesto su nombre
    if (!customerName.trim()) {
      setErrorMessage("Por favor, ingresá tu nombre para confirmar el pedido.");
      return;
    }
    
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // 2. Generamos un código de pedido único (Ej: CBA-8492)
      const randomNumbers = Math.floor(1000 + Math.random() * 9000);
      const orderCode = `CBA-${randomNumbers}`;

      // 3. Guardamos el pedido en Supabase a través de nuestra nueva API
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo_pedido: orderCode,
          nombre_cliente: customerName.trim(),
          productos: cart,
          total: total
        }),
      });

      if (!response.ok) {
        throw new Error("No pudimos registrar tu pedido en el sistema. Intentá de nuevo.");
      }

      // 4. CONFIGURÁ TU NÚMERO DE WHATSAPP AQUÍ
      const phoneNumber = "5493518089416"; 

      // 5. Armamos el mensaje automático INCLUYENDO EL CÓDIGO
      let message = `¡Hola Polirubro Online! Mi nombre es *${customerName.trim()}* y quiero confirmar mi pedido *#${orderCode}*:\n\n`;
      
      cart.forEach(item => {
        const cleanPrice = Number(String(item.price).replace(/\./g, '').replace(',', '.'));
        message += `▪️ ${item.quantity || 1}x ${item.name} - $${cleanPrice.toLocaleString('es-AR')}\n`;
      });

      message += `\n*Total a pagar: $${total.toLocaleString('es-AR')}*\n\n¿Me confirman si hay stock para realizar el pago?`;

      // 6. Abrimos WhatsApp
      const whatsappUrl = `https://wa.me/${5493518089416}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
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
        
        {/* Panel para pedir el nombre del cliente */}
        <div className="bg-gray-850 p-6 sm:p-8 border-t border-gray-700">
          <label htmlFor="customerName" className="block text-gray-300 font-bold mb-2">
            ¿Quién realiza la compra?
          </label>
          <input 
            type="text" 
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Ingresá tu nombre y apellido" 
            className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#FF9980] transition-all"
            disabled={isProcessing}
          />
          {errorMessage && (
            <p className="text-red-400 text-sm mt-2 font-bold animate-pulse">⚠️ {errorMessage}</p>
          )}
        </div>

        {/* Total y botón de WhatsApp */}
        <div className="bg-gray-900 p-6 sm:p-10 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="text-center sm:text-left">
            <p className="text-gray-400 font-bold text-xl mb-1 uppercase tracking-wider">Total a pagar</p>
            <p className="text-5xl font-black text-[#FF9980] drop-shadow-sm">
              ${total.toLocaleString('es-AR')}
            </p>
          </div>
          
          <button 
            onClick={handleWhatsAppCheckout}
            disabled={isProcessing}
            className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1ebe57] disabled:bg-gray-600 text-white font-black text-xl py-5 px-8 rounded-full shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center gap-3"
          >
            {isProcessing ? (
              <span className="animate-pulse">Procesando...</span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.245 3.483 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                Confirmar pedido
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}