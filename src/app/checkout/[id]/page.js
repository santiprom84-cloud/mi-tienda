'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function CheckoutSuccessPage({ params }) {
  const { id } = params; // Este es el ID del pedido
  const { user, loadingAuth } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // === ⚠️ DATOS IMPORTANTES A MODIFICAR ⚠️ ===
  const MI_ALIAS = "santimarquez."; // Poné acá tu alias de Mercado Pago o banco
  const MI_TITULAR = "Santiago Alejo Márquez"; // Tu nombre
  const MI_WHATSAPP = "5493518089416"; // Tu número de WhatsApp (Código de país + área sin 0 + número sin 15)
  // ==========================================

  useEffect(() => {
    if (user && id) {
      fetchOrder();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error("Error al buscar el pedido:", error);
    } finally {
      setLoading(false);
    }
  };

  const copiarAlias = () => {
    navigator.clipboard.writeText(MI_ALIAS);
    alert("¡Alias copiado al portapapeles!");
  };

  if (loadingAuth || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF9980]"></div>
        <p className="text-[#FF9980] font-bold mt-4 animate-pulse">Preparando tu orden...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <span className="text-6xl mb-4">⚠️</span>
        <h1 className="text-2xl font-bold text-gray-100">No encontramos este pedido.</h1>
        <Link href="/" className="mt-6 text-[#FF9980] underline font-bold">Volver a la tienda</Link>
      </div>
    );
  }

  // Armamos el mensaje predeterminado para WhatsApp
  const orderNumber = order.id.split('-')[0].toUpperCase();
  const mensajeWa = `¡Hola! Acabo de hacer el pedido #${orderNumber} por $${order.total}. Te adjunto el comprobante de transferencia.`;
  const linkWhatsapp = `https://wa.me/${MI_WHATSAPP}?text=${encodeURIComponent(mensajeWa)}`;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 mt-8 mb-20">
      <div className="bg-gray-800 p-8 sm:p-12 rounded-3xl border border-gray-700 shadow-2xl text-center relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-green-400 to-emerald-500"></div>

        <span className="text-7xl block mb-6 animate-bounce">🎉</span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-100 mb-2">¡Pedido Generado!</h1>
        <p className="text-gray-400 text-lg mb-8">
          Tu orden <strong className="text-white">#{orderNumber}</strong> ya está reservada.
        </p>

        <div className="bg-gray-900 border border-[#FF9980]/50 rounded-2xl p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-[#FF9980] mb-6 uppercase tracking-wider">Instrucciones de Pago</h2>
          
          <div className="text-left space-y-4 max-w-sm mx-auto">
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400 font-bold">Total a pagar:</span>
              <span className="text-white font-black text-xl">${order.total.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-2 items-center">
              <span className="text-gray-400 font-bold">Alias:</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">{MI_ALIAS}</span>
                <button onClick={copiarAlias} className="bg-gray-700 hover:bg-gray-600 text-white p-1.5 rounded-md transition-colors" title="Copiar Alias">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-gray-400 font-bold">Titular:</span>
              <span className="text-gray-300 text-sm font-bold">{MI_TITULAR}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <p className="text-gray-300 text-sm font-bold mb-4">
            Una vez realizada la transferencia, envianos el comprobante haciendo clic en el siguiente botón:
          </p>

          <a 
            href={linkWhatsapp} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-black py-4 px-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 text-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 1.777 6.289L.302 23.7l5.568-1.46A11.956 11.956 0 0 0 11.944 24 12 12 0 0 0 24 12 12 12 0 0 0 11.944 0zM7.228 5.704c.264-.002.536.002.77.014.246.012.576.104.752.518.21.488.72 1.764.786 1.896.066.132.112.288.028.456-.084.17-.128.272-.256.422-.128.15-.27.326-.388.456-.134.148-.276.31-.122.578.156.268.694 1.148 1.486 1.854.912.81 1.742 1.066 2.012 1.196.27.13.432.108.594-.078.16-.188.694-.808.88-1.086.186-.276.372-.232.616-.138.244.094 1.544.73 1.808.86.266.132.444.198.508.31.064.11.064.646-.208 1.272-.27.626-1.59 1.232-2.192 1.274-.582.04-1.222.186-3.87-1.074-3.21-1.528-5.26-4.81-5.418-5.022-.158-.212-1.294-1.724-1.294-3.29s.814-2.336 1.11-2.658c.294-.322.642-.404.856-.404z"/></svg>
            Enviar Comprobante
          </a>

          <Link href="/perfil" className="block w-full text-gray-400 hover:text-[#FF9980] font-bold underline transition-colors pt-4">
            Ver estado en Mis Pedidos
          </Link>
        </div>
      </div>
    </div>
  );
}