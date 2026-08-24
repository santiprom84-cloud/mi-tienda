'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function DynamicCheckoutPage() {
  // SOLUCIÓN: useParams() atrapa el ID de la URL de forma 100% segura en Next.js
  const params = useParams();
  const id = params?.id; 
  
  const router = useRouter();
  const { clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ⚠️ PONÉ TU NÚMERO DE WHATSAPP ACÁ (Código de área de Córdoba 351)
  const NUMERO_WHATSAPP = "5493510000000"; 

  // Esta función busca el pedido en Supabase apenas tenemos el ID
  useEffect(() => {
    if (!id) return; // Si todavía no leyó la URL, espera sin trabarse.

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('pedidos').select('*').eq('id', id).single();
        
        if (error || !data) {
          console.error("Error buscando el pedido:", error);
          setFetchError(true);
          return;
        }
        
        setOrder(data);
      } catch (err) {
        console.error("Fallo del sistema:", err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Actualiza el pedido en la base de datos con los datos del cliente
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('pedidos').update({
        user_name: formData.name,
        user_email: formData.email,
        user_phone: formData.phone,
      }).eq('id', id);

      if (error) throw error;
      
      clearCart(); // Vaciamos el carrito
      setIsSuccess(true);
    } catch (error) {
      alert(`Error al guardar tus datos: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- PANTALLA DE CARGA INFINITA CORREGIDA ---
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF9980]"></div>
        <p className="text-[#FF9980] font-bold mt-6 animate-pulse text-lg">Cargando tu pedido...</p>
      </div>
    );
  }

  // --- PANTALLA DE ERROR VISUAL (Si falla la base de datos) ---
  if (fetchError || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full bg-gray-900 rounded-3xl border border-red-900/50 shadow-2xl p-8 text-center">
          <span className="text-6xl mb-4 block">⚠️</span>
          <h2 className="text-2xl font-black text-white mb-2">Pedido no encontrado</h2>
          <p className="text-gray-400 mb-8">Es posible que el enlace sea incorrecto o el pedido haya expirado por seguridad.</p>
          <button onClick={() => router.push('/')} className="bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black px-8 py-3 rounded-xl transition-transform transform hover:-translate-y-1 w-full">
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  // --- PANTALLA DE ÉXITO: Flujo de confirmación por WhatsApp ---
  if (isSuccess && order) {
    const shortOrderId = order.id.split('-')[0].toUpperCase();
    const whatsappMessage = encodeURIComponent(`¡Hola! Acabo de registrar mis datos para el pedido #${shortOrderId} en Polirubro Online por un total de $${order.total.toLocaleString('es-AR')}.\n\nQuiero confirmar el stock de los productos y coordinar el envío. ¡Aguardo tu confirmación!`);
    const whatsappLink = `https://wa.me/${5493518089416}?text=${whatsappMessage}`;

    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
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
              Para garantizar que recibas todo perfecto, necesitamos confirmar el stock y calcular el costo de envío.
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
              Una vez que nos escribas y te confirmemos todo, te pasaremos nuestro Alias para transferir y coordinaremos la entrega.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- PANTALLA DE FORMULARIO DE DATOS ---
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 mt-10 mb-20 animate-fade-in">
      <h1 className="text-3xl font-black text-white mb-8 border-b border-gray-800 pb-4">Finalizar Compra</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* RESUMEN DEL PEDIDO OBTENIDO DE LA BASE DE DATOS */}
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 h-fit shadow-xl">
          <h2 className="text-[#FF9980] font-black uppercase tracking-widest text-sm mb-6">Tu Pedido #{order.id.split('-')[0].toUpperCase()}</h2>
          
          <ul className="space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar pr-2">
            {order.items && order.items.map((item, index) => (
              <li key={index} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded-md font-bold text-xs">{item.quantity}x</span>
                  <span className="text-gray-200 line-clamp-1">{item.name}</span>
                </div>
                <span className="font-mono text-gray-400">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
              </li>
            ))}
          </ul>
          
          <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
            <span className="text-white font-bold">Total a pagar</span>
            <span className="text-2xl font-black text-[#FF9980]">${Number(order.total).toLocaleString('es-AR')}</span>
          </div>
        </div>

        {/* FORMULARIO DE DATOS */}
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl">
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

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-4 rounded-xl mt-4 transition-transform transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none">
              {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}