'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext'; // Importamos la sesión del usuario

export default function DynamicCheckoutPage() {
  const params = useParams();
  const id = params?.id; 
  
  const router = useRouter();
  const { clearCart } = useCart();
  const { user } = useAuth(); // Traemos los datos de si está logueado

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // El formulario ahora solo pide el nombre
  const [formData, setFormData] = useState({ name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ⚠️ PONÉ TU NÚMERO DE WHATSAPP ACÁ (Código de área de Córdoba 351)
  const NUMERO_WHATSAPP = "5493510000000"; 

  // Autocompletar el nombre si el usuario ya inició sesión
  useEffect(() => {
    if (user) {
      const defaultName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
      setFormData({ name: defaultName });
    }
  }, [user]);

  // Buscar el pedido en la base de datos
  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('pedidos').select('*').eq('id', id).single();
        
        if (error || !data) {
          setFetchError(true);
          return;
        }
        
        setOrder(data);
      } catch (err) {
        console.error(err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Actualizar el nombre en la orden y pasar a la pantalla de WhatsApp
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('pedidos').update({
        user_name: formData.name,
        user_email: user?.email || 'Invitado sin email', // Guardamos el email de fondo si existe
        user_phone: 'A confirmar por WhatsApp', // Rellenamos para que no quede nulo
      }).eq('id', id);

      if (error) throw error;
      
      clearCart(); 
      setIsSuccess(true);
    } catch (error) {
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- PANTALLA DE CARGA ---
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF9980]"></div>
        <p className="text-[#FF9980] font-bold mt-6 animate-pulse text-lg">Preparando tu compra...</p>
      </div>
    );
  }

  // --- PANTALLA DE ERROR VISUAL ---
  if (fetchError || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full bg-gray-900 rounded-3xl border border-red-900/50 shadow-2xl p-8 text-center">
          <span className="text-6xl mb-4 block">⚠️</span>
          <h2 className="text-2xl font-black text-white mb-2">Pedido no encontrado</h2>
          <p className="text-gray-400 mb-8">Es posible que el enlace sea incorrecto o la sesión haya expirado.</p>
          <button onClick={() => router.push('/')} className="bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black px-8 py-3 rounded-xl transition-transform transform hover:-translate-y-1 w-full">
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  // --- PANTALLA DE ÉXITO (EL CARTEL DE WHATSAPP) ---
  if (isSuccess && order) {
    const shortOrderId = order.id.split('-')[0].toUpperCase();
    // TEXTO EXACTO QUE PEDISTE
    const whatsappMessage = encodeURIComponent(`¡Hola! Acabo de registrar mis datos para el pedido #${shortOrderId} en Polirubro Online por un total de $${order.total.toLocaleString('es-AR')}.\n\nQuiero confirmar el pedido para ver si hay stock y ver el tema del envío.`);
    const whatsappLink = `https://wa.me/${5493518089416}?text=${whatsappMessage}`;

    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl p-8 text-center animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#25D366] to-[#128C7E]"></div>
          
          <div className="w-24 h-24 bg-[#25D366]/20 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#25D366]/50 shadow-[0_0_30px_rgba(37,211,102,0.3)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </div>
          
          <h1 className="text-3xl font-black text-white mb-2">¡Último Paso!</h1>
          <p className="text-gray-400 mb-8">Orden reservada bajo el código <strong className="text-white">#{shortOrderId}</strong></p>

          <div className="bg-gray-800 rounded-2xl p-6 mb-8 text-left border border-gray-700">
            <p className="text-gray-300 text-center font-medium">
              Escribinos por WhatsApp para confirmar que tenemos stock de tus productos y coordinar la entrega.
            </p>
          </div>
            
          <a 
            href={whatsappLink} 
            target="_blank" 
            rel="noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20b858] text-gray-900 font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-transform transform hover:-translate-y-1 shadow-xl shadow-[#25D366]/20 text-lg"
          >
            Confirmar por WhatsApp
          </a>

          <button onClick={() => router.push('/')} className="mt-8 text-gray-500 hover:text-white font-bold text-sm transition-colors underline">
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  // --- PANTALLA DE FORMULARIO DE DATOS REDISEÑADA ---
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 mt-10 mb-20 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Finalizar Compra</h1>
        <p className="text-gray-400">Verificá tu pedido y decinos a qué nombre lo reservamos.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* COLUMNA IZQUIERDA: RESUMEN PREMIUM CON IMÁGENES */}
        <div className="lg:col-span-3 bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-xl h-fit">
          <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
            <h2 className="text-[#FF9980] font-black uppercase tracking-widest text-sm">Resumen de tu pedido</h2>
            <span className="bg-gray-800 text-gray-300 text-xs font-bold px-3 py-1 rounded-full">#{order.id.split('-')[0].toUpperCase()}</span>
          </div>
          
          <ul className="space-y-4 mb-8 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {order.items && order.items.map((item, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-800/40 p-3 sm:p-4 rounded-2xl border border-gray-700/50 hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-4">
                  {/* CUADRO DE IMAGEN DEL PRODUCTO */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-900 rounded-xl flex-shrink-0 overflow-hidden border border-gray-700 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">🛍️</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-gray-100 font-bold text-sm sm:text-base line-clamp-2 pr-2">{item.name}</h3>
                    <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs font-black mt-2 inline-block">Cant: {item.quantity}</span>
                  </div>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <span className="block font-black text-[#FF9980] text-sm sm:text-lg">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="border-t border-gray-800 pt-6 flex justify-between items-center">
            <span className="text-gray-300 font-bold text-lg">Total a pagar</span>
            <span className="text-3xl font-black text-[#FF9980]">${Number(order.total).toLocaleString('es-AR')}</span>
          </div>
        </div>

        {/* COLUMNA DERECHA: FORMULARIO SIMPLIFICADO */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-xl sticky top-24">
            <h2 className="text-[#FF9980] font-black uppercase tracking-widest text-sm mb-6 border-b border-gray-800 pb-4">Tus Datos</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">¿A nombre de quién reservamos? *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej: Juan Pérez"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#FF9980]/50 focus:border-[#FF9980] transition-all placeholder-gray-500" 
                />
              </div>

              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Al confirmar, te redirigiremos a <strong className="text-[#25D366]">WhatsApp</strong> para que nos envíes un mensaje y podamos coordinar el envío de tus productos de forma personalizada.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !formData.name.trim()} 
                className="w-full bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-4 rounded-xl transition-transform transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none shadow-lg shadow-[#FF9980]/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Guardando...' : 'Confirmar y Continuar'}
                {!isSubmitting && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}