"use client";

import { useCart } from '@/context/CartContext';

export default function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart } = useCart();

  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Hubo un error al generar el pago. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error en el pago:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Tu Carrito</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-900 transition-colors bg-slate-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-slate-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <p className="text-slate-500 font-medium">Tu carrito está vacío.</p>
            </div>
          ) : (
            <ul className="space-y-6">
              {cart.map((item) => (
                <li key={item.id} className="flex gap-4 items-center">
                  <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-xl bg-slate-100 border border-slate-200" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 line-clamp-1">{item.name}</h3>
                    <p className="text-slate-500 text-sm mt-1">Cant: {item.quantity}</p>
                    <p className="font-bold text-slate-900 mt-1">${Number(item.price).toLocaleString('es-AR')}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold text-slate-600 uppercase tracking-wider text-sm">Total a pagar</span>
              <span className="text-2xl font-extrabold text-slate-900">${totalPrice.toLocaleString('es-AR')}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition-colors shadow-md active:scale-[0.98]"
            >
              Iniciar Compra
            </button>
          </div>
        )}
      </div>
    </div>
  );
}