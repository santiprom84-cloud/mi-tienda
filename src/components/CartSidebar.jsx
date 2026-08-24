'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function CartSidebar({ isOpen, onClose }) {
  const { cart, cartTotal, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();

  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    if (onClose) onClose(); // Cierra el menú lateral
    router.push('/checkout'); // Nos envía directo al formulario para pedir datos
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-gray-900 h-full shadow-2xl flex flex-col border-l border-gray-800 animate-slide-in-right">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900">
          <h2 className="text-xl font-black text-white flex items-center gap-2"><span>🛒</span> Tu Carrito</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <span className="text-5xl mb-4 block">😔</span>
              <p className="font-bold text-lg">Tu carrito está vacío</p>
              <p className="text-sm mt-2">Agregá algunos productos para continuar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 bg-gray-800 p-3 rounded-2xl border border-gray-700 relative group">
                  <img src={item.image || 'https://via.placeholder.com/80'} alt={item.name} className="w-20 h-20 object-cover rounded-xl border border-gray-700" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-white font-bold text-sm line-clamp-2">{item.name}</h3>
                      <p className="text-[#FF9980] font-black text-sm mt-1">${Number(item.price).toLocaleString('es-AR')}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center bg-gray-900 rounded-lg">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white font-bold transition-colors">-</button>
                        <span className="text-white font-bold text-xs w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white font-bold transition-colors">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-400 text-xs font-bold underline">Quitar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-800 bg-gray-900">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-400 font-bold">Total a pagar:</span>
              <span className="text-2xl font-black text-[#FF9980]">${cartTotal.toLocaleString('es-AR')}</span>
            </div>
            <button
              onClick={handleCheckoutClick}
              className="w-full bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-4 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1"
            >
              Finalizar Compra
            </button>
          </div>
        )}
      </div>
    </div>
  );
}