'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PagarPage() {
  const [codigo, setCodigo] = useState('');
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState(null);
  const [loadingPago, setLoadingPago] = useState(false);

  const buscarPedido = async (e) => {
    e.preventDefault();
    if (!codigo.trim()) return;

    setLoading(true);
    setErrorBusqueda(null);
    setPedido(null);

    // Limpiamos el código para asegurarnos de que el formato sea correcto
    let codigoLimpio = codigo.trim().toUpperCase();
    if (!codigoLimpio.startsWith('CBA-') && !codigoLimpio.startsWith('#')) {
      codigoLimpio = `CBA-${codigoLimpio}`;
    }
    codigoLimpio = codigoLimpio.replace('#', '');

    try {
      const response = await fetch(`/api/pedidos/${codigoLimpio}`);
      const textResponse = await response.text();
      
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (err) {
        throw new Error("Error de conexión con la base de datos al buscar el pedido.");
      }

      if (!response.ok) {
        throw new Error(data.error || 'No pudimos encontrar tu pedido.');
      }

      setPedido(data.pedido);
    } catch (error) {
      setErrorBusqueda(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePagar = async () => {
    setLoadingPago(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: pedido.productos }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details?.message || data.error || 'Error de conexión con Mercado Pago');
      }

      // Redirigimos a la pasarela de pagos
      window.location.href = data.url;
    } catch (error) {
      alert(`Hubo un error al iniciar el pago: ${error.message}`);
      setLoadingPago(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8 mt-10 min-h-[60vh] flex flex-col justify-center">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-[#FF9980] mb-4 drop-shadow-sm">
          Abonar Pedido
        </h1>
        <p className="text-gray-400 text-lg">
          Ingresá el código que te enviamos por WhatsApp para proceder con el pago seguro.
        </p>
      </div>

      {!pedido ? (
        <div className="bg-gray-800 p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-700">
          <form onSubmit={buscarPedido} className="flex flex-col gap-6">
            <div>
              <label htmlFor="codigo" className="block text-gray-300 font-bold mb-3 text-lg">
                Código de Pedido
              </label>
              <input 
                type="text" 
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ej: CBA-1234" 
                className="w-full bg-gray-900 border-2 border-gray-600 text-gray-100 rounded-xl p-5 text-xl font-mono uppercase focus:outline-none focus:border-[#FF9980] transition-colors text-center tracking-widest"
                disabled={loading}
              />
            </div>
            
            {errorBusqueda && (
              <p className="text-red-400 bg-red-900/30 p-4 rounded-lg font-bold text-center border border-red-500/50">
                ⚠️ {errorBusqueda}
              </p>
            )}

            <button 
              type="submit"
              disabled={loading || !codigo.trim()}
              className="w-full bg-[#FF9980] hover:bg-[#ff8060] disabled:bg-gray-600 text-gray-900 font-black text-xl py-5 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 mt-2"
            >
              {loading ? 'Buscando...' : 'Buscar mi pedido'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-3xl shadow-xl border border-[#FF9980]/50 overflow-hidden">
          <div className="bg-gray-900 p-6 text-center border-b border-gray-700">
            <h2 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-1">Pedido Encontrado</h2>
            <p className="text-3xl font-black text-gray-100 uppercase">#{pedido.codigo_pedido}</p>
            <p className="text-[#FF9980] font-bold mt-2">A nombre de: {pedido.nombre_cliente}</p>
          </div>
          
          <ul className="divide-y divide-gray-700 p-6">
            {pedido.productos.map((item, index) => {
              const cleanPrice = Number(String(item.price).replace(/\./g, '').replace(',', '.'));
              return (
                <li key={index} className="py-4 flex justify-between items-center gap-4">
                  <div>
                    <p className="font-bold text-gray-100">{item.name}</p>
                    <p className="text-sm text-gray-400">Cantidad: {item.quantity || 1}</p>
                  </div>
                  <span className="font-black text-lg text-gray-200">
                    ${cleanPrice.toLocaleString('es-AR')}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="bg-gray-900 p-6 sm:p-8 flex flex-col gap-6 items-center">
            <div className="text-center w-full pb-6 border-b border-gray-800">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">Total a Pagar</p>
              <p className="text-5xl font-black text-[#FF9980]">
                ${Number(pedido.total).toLocaleString('es-AR')}
              </p>
            </div>
            
            <button 
              onClick={handlePagar}
              disabled={loadingPago}
              className="w-full bg-[#009EE3] hover:bg-[#008ACA] disabled:bg-gray-600 text-white font-black text-xl py-5 rounded-xl shadow-[0_0_15px_rgba(0,158,227,0.4)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              {loadingPago ? 'Conectando...' : 'Pagar con Mercado Pago'}
            </button>

            <button 
              onClick={() => setPedido(null)}
              className="text-gray-400 hover:text-white font-bold underline text-sm transition-colors"
            >
              Ingresar otro código
            </button>
          </div>
        </div>
      )}
    </div>
  );
}