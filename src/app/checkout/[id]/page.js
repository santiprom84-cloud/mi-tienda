'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext'; 

export default function DynamicCheckoutPage() {
  const params = useParams();
  const id = params?.id; 
  
  const router = useRouter();
  const { clearCart } = useCart();
  const { user } = useAuth(); 

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const [formData, setFormData] = useState({ name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // DATOS REALES DE COBRO Y CONTACTO
  const NUMERO_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const DATOS_BANCO = {
    titular: process.env.NEXT_PUBLIC_BANK_TITULAR,
    alias: process.env.NEXT_PUBLIC_BANK_ALIAS,
    cvu: process.env.NEXT_PUBLIC_BANK_CVU,
    banco: process.env.NEXT_PUBLIC_BANK_NOMBRE
  };

  useEffect(() => {
    if (user) {
      const defaultName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
      setFormData({ name: defaultName });
    }
  }, [user]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('pedidos').update({
        user_name: formData.name,
        user_email: user?.email || 'Invitado sin email', 
        user_phone: 'A confirmar por WhatsApp', 
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

  const copiarAlias = () => {
    navigator.clipboard.writeText(DATOS_BANCO.alias);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF9980]"></div>
        <p className="text-[#FF9980] font-bold mt-6 animate-pulse text-lg">Preparando tu compra...</p>
      </div>
    );
  }

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

  // --- PANTALLA DE ÉXITO ACTUALIZADA: NUEVO FLUJO ---
  if (isSuccess && order) {
    const shortOrderId = order.id.split('-')[0].toUpperCase();
    const whatsappMessage = encodeURIComponent(`¡Hola! Acabo de registrar el pedido #${shortOrderId} en la tienda por un total de $${order.total.toLocaleString('es-AR')}.\n\nQuiero confirmar si tienen stock de mis productos y consultar por el envío antes de hacer la transferencia.`);
    const whatsappLink = `https://wa.me/${NUMERO_WHATSAPP}?text=${whatsappMessage}`;

    return (
      <div className="min-h-[90vh] flex items-center justify-center p-4 py-12">
        <div className="max-w-3xl w-full bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl p-6 sm:p-10 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FF9980] to-purple-600"></div>
          
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">¡Pedido Reservado!</h1>
            <p className="text-[#FF9980] font-mono text-lg font-bold">Orden #{shortOrderId}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* PASO 1: CONFIRMAR POR WHATSAPP */}
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 flex flex-col justify-between relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#25D366]/10 rounded-bl-full -mr-2 -mt-2"></div>
              <div>
                <h2 className="text-white font-bold mb-4 flex items-center gap-2 relative z-10">
                  <span className="bg-[#FF9980] text-gray-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">1</span> 
                  Confirmar Stock
                </h2>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed relative z-10">
                  Antes de transferir, escribinos por WhatsApp para asegurarnos de tener todo listo y coordinar el envío.
                </p>
              </div>
              
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20b858] text-gray-900 font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-transform transform hover:-translate-y-1 shadow-lg shadow-[#25D366]/20 text-sm relative z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                Confirmar por WhatsApp
              </a>
            </div>

            {/* PASO 2: DATOS DE PAGO (SOLO DESPUÉS DEL OK) */}
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 relative overflow-hidden shadow-lg opacity-90">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="bg-[#FF9980] text-gray-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">2</span> 
                Datos de Pago
              </h2>
              <p className="text-gray-500 text-xs mb-4">
                Una vez que te demos el OK por mensaje, transferí a esta cuenta:
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                  <span className="text-gray-500 text-xs font-bold uppercase">Banco</span>
                  <span className="text-gray-200 font-medium text-right">{DATOS_BANCO.banco}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                  <span className="text-gray-500 text-xs font-bold uppercase">Titular</span>
                  <span className="text-gray-200 font-medium text-right truncate pl-4">{DATOS_BANCO.titular}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                  <span className="text-gray-500 text-xs font-bold uppercase">CVU</span>
                  <span className="text-gray-200 font-medium text-right tracking-wider">{DATOS_BANCO.cvu}</span>
                </div>
                <div className="bg-gray-900 p-3 rounded-xl border border-gray-700 flex justify-between items-center mt-4">
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Alias</p>
                    <p className="text-[#FF9980] font-mono font-bold tracking-wider text-base">{DATOS_BANCO.alias}</p>
                  </div>
                  <button onClick={copiarAlias} className="text-gray-400 hover:text-white transition-colors p-3 bg-gray-800 hover:bg-gray-700 rounded-xl" title="Copiar Alias">
                    {copied ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button onClick={() => router.push('/')} className="text-gray-500 hover:text-white font-bold text-sm transition-colors underline">
              Volver a la tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- PANTALLA DE FORMULARIO ---
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 mt-6 sm:mt-10 mb-20 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Finalizar Compra</h1>
        <p className="text-gray-400">Verificá tu pedido y decinos a qué nombre lo reservamos.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        <div className="lg:col-span-3 bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-xl h-fit">
          <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
            <h2 className="text-[#FF9980] font-black uppercase tracking-widest text-sm">Resumen de tu pedido</h2>
            <span className="bg-gray-800 text-gray-300 text-xs font-bold px-3 py-1 rounded-full">#{order.id.split('-')[0].toUpperCase()}</span>
          </div>
          
          <ul className="space-y-4 mb-8 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {order.items && order.items.map((item, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-800/40 p-3 sm:p-4 rounded-2xl border border-gray-700/50 hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-4">
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

        <div className="lg:col-span-2">
          <div className="bg-gray-900 p-5 sm:p-8 rounded-3xl border border-gray-800 shadow-xl sticky top-24">
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
                  Al confirmar, te daremos los pasos para consultar el stock por <strong className="text-[#25D366]">WhatsApp</strong> y te mostraremos los datos para transferir de forma segura.
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