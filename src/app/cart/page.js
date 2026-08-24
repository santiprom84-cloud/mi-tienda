'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CartPage() {
  const { cart, cartTotal, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 mt-10 mb-20 animate-fade-in">
      <h1 className="text-3xl font-black text-white mb-8 border-b border-gray-800 pb-4">Tu Carrito</h1>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 rounded-3xl border border-gray-800 shadow-xl">
          <span className="text-6xl mb-4 block">🛒</span>
          <h2 className="text-xl font-bold text-white mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-400 mb-6">Parece que aún no agregaste ningún producto a tu compra.</p>
          <Link href="/" className="bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black px-8 py-3 rounded-xl transition-transform transform hover:-translate-y-1 inline-block">
            Volver a la tienda
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="bg-gray-900 p-4 rounded-2xl border border-gray-800 flex items-center gap-4 shadow-md">
                <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} className="w-20 h-20 object-cover rounded-xl border border-gray-700" />
                <div className="flex-grow">
                  <h3 className="text-white font-bold text-lg line-clamp-1">{item.name}</h3>
                  <p className="text-[#FF9980] font-black">${Number(item.price).toLocaleString('es-AR')}</p>
                </div>
                <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-1">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white font-bold transition-colors">-</button>
                  <span className="text-white font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white font-bold transition-colors">+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="w-10 h-10 flex items-center justify-center bg-red-900/30 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 h-fit shadow-xl">
            <h2 className="text-white font-black text-xl mb-6">Resumen de Compra</h2>
            <div className="flex justify-between items-center mb-4 text-gray-400">
              <span>Subtotal</span>
              <span>${cartTotal.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between items-center mb-6 text-gray-400">
              <span>Envío</span>
              <span>A coordinar</span>
            </div>
            <div className="border-t border-gray-800 pt-4 flex justify-between items-center mb-8">
              <span className="text-white font-bold text-lg">Total final</span>
              <span className="text-2xl font-black text-[#FF9980]">${cartTotal.toLocaleString('es-AR')}</span>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-4 rounded-xl transition-transform transform hover:-translate-y-1 shadow-lg shadow-[#FF9980]/20"
            >
              Completar mis datos
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full mt-3 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-colors"
            >
              Seguir Comprando
            </button>
          </div>
        </div>
      )}
    </div>
  );
}