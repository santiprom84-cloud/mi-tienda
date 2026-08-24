'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
// Asumiendo que tenes un contexto de carrito. Si usas otro nombre, cambialo acá.
import { useCart } from '@/context/CartContext'; 

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  // ⚠️ PONÉ TU NÚMERO DE WHATSAPP ACÁ (Código de área de Córdoba 351)
  const NUMERO_WHATSAPP = "5493510000000"; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Formateamos el pedido para Supabase
      const newOrder = {
        user_email: formData.email,
        user_name: formData.name,
        user_phone: formData.phone,
        total: cartTotal,
        status: 'pendiente',
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };

      const { data, error } = await supabase.from('pedidos').insert([newOrder]).select().single();
      
      if (error) throw error;

      setOrderId(data.id);
      setIsSuccess(true);
      clearCart(); 
    } catch (error) {
      alert(`Error al generar pedido: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- PANTALLA DE ÉXITO: Flujo de confirmación por WhatsApp ---
  if (isSuccess) {
    const shortOrderId = orderId.split('-')[0].toUpperCase();
    const whatsappMessage = encodeURIComponent(`¡Hola! Acabo de realizar el pedido #${shortOrderId} en Polirubro Online por un total de $${cartTotal.toLocaleString('es-AR')}.\n\nQuiero confirmar el stock de mis productos y coordinar el tema del envío. ¡Aguardo tu confirmación para poder realizar el pago!`);
    const whatsappLink = `https://wa.me/${5493518089416}?text=${whatsappMessage}`;

    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl p-8 text-center animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FF9980] to-purple-600"></div>
          
          <div className="w-20 h-20 bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          
          <h1 className="text-3xl font-black text-white mb-2">¡Pedido Reservado!</h1>
          <p className="text-[#FF9980] font-mono text-lg font-bold mb-8">Orden #{shortOrderId}</p>

          <div className="bg-gray-800 rounded-2xl p-6 mb-8 text-left border border-gray-700">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="bg-[#FF9980] text-gray-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">1</span> 
              Confirmación Obligatoria
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Para garantizar que recibas todo perfecto, necesitamos confirmar el stock de tus productos y calcular el costo de envío (si aplica).
            </p>
            
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20b858] text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-transform transform hover:-translate-y-1 shadow-lg shadow-[#25D366]/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              Enviar WhatsApp Ahora
            </a>
          </div>

          <div className="bg-gray-800/50 rounded-2xl p-6 text-left border border-gray-700/50">
            <h2 className="text-gray-300 font-bold mb-2 flex items-center gap-2">
              <span className="bg-gray-700 text-gray-300 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">2</span> 
              Pago y Envío
            </h2>
            <p className="text-gray-500 text-sm">
              Una vez que nos escribas y te confirmemos todo por WhatsApp, ahí mismo te pasaremos nuestro <strong>Alias bancario</strong> para realizar la transferencia y coordinaremos la entrega.
            </p>
          </div>

          <button onClick={() => router.push('/')} className="mt-8 text-gray-400 hover:text-white font-bold text-sm transition-colors underline">
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  // --- PANTALLA DE FORMULARIO DE CHECKOUT NORMAL ---
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 mt-10 mb-20 animate-fade-in">
      <h1 className="text-3xl font-black text-white mb-8 border-b border-gray-800 pb-4">Finalizar Compra</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* RESUMEN DEL CARRITO */}
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 h-fit">
          <h2 className="text-[#FF9980] font-black uppercase tracking-widest text-sm mb-6">Tu Pedido</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">No hay productos.</p>
          ) : (
            <ul className="space-y-4 mb-6">
              {cart.map(item => (
                <li key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded-md font-bold text-xs">{item.quantity}x</span>
                    <span className="text-gray-200 line-clamp-1">{item.name}</span>
                  </div>
                  <span className="font-mono text-gray-400">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
            <span className="text-white font-bold">Total a pagar</span>
            <span className="text-2xl font-black text-[#FF9980]">${cartTotal.toLocaleString('es-AR')}</span>
          </div>
        </div>

        {/* FORMULARIO DE DATOS */}
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
          <h2 className="text-[#FF9980] font-black uppercase tracking-widest text-sm mb-6">Tus Datos</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">Nombre Completo *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF9980]" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">Email *</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF9980]" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">Teléfono / WhatsApp *</label>
              <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF9980]" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">Dirección de Entrega (Opcional)</label>
              <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Ej: Av. Colón 1234, Dpto 2B" className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF9980]" />
            </div>

            <button type="submit" disabled={isSubmitting || cart.length === 0} className="w-full bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-4 rounded-xl mt-4 transition-transform transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none">
              {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}