'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [imgZoomed, setImgZoomed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (id) fetchProductDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error al buscar el producto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5493518089416';
  const whatsappMsg = product
    ? encodeURIComponent(`Hola! Me interesa el producto: *${product.name}* ($${Number(product.price).toLocaleString('es-AR')}). ¿Está disponible?`)
    : '';

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF9980]"></div>
        <p className="text-[#FF9980] font-bold mt-4 animate-pulse">Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <span className="text-6xl mb-4">🛒</span>
        <h1 className="text-2xl font-bold text-gray-100">Producto no encontrado</h1>
        <p className="text-gray-400 mt-2">El artículo que buscás no existe o fue eliminado.</p>
        <Link href="/" className="mt-6 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-28">

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 font-bold">
        <button
          onClick={() => router.back()}
          className="hover:text-[#FF9980] transition-colors flex items-center gap-1.5 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Volver
        </button>
        <span className="text-gray-700">/</span>
        {product.category && (
          <>
            <Link href={`/?categoria=${encodeURIComponent(product.category)}`} className="hover:text-[#FF9980] transition-colors truncate max-w-[120px]">
              {product.category}
            </Link>
            <span className="text-gray-700">/</span>
          </>
        )}
        <span className="text-gray-400 truncate max-w-[160px]">{product.name}</span>
      </nav>

      {/* Card principal */}
      <div className="bg-gray-800 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col lg:flex-row">

        {/* ── Imagen ── */}
        <div className="w-full lg:w-[52%] bg-gray-900 relative flex-shrink-0">

          {/* Badge categoría */}
          {product.category && (
            <span className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md text-[#FF9980] text-xs font-black px-3 py-1.5 rounded-full border border-[#FF9980]/30 uppercase tracking-wider shadow-lg">
              {product.category}
            </span>
          )}

          {/* Badge destacado */}
          {product.featured && (
            <span className="absolute top-4 right-4 z-20 bg-yellow-500/20 backdrop-blur-md text-yellow-400 text-xs font-black px-3 py-1.5 rounded-full border border-yellow-500/30 flex items-center gap-1">
              ⭐ Destacado
            </span>
          )}

          {/* Imagen con zoom al click */}
          <div
            className="aspect-square w-full relative overflow-hidden cursor-zoom-in"
            onClick={() => setImgZoomed(true)}
          >
            {/* Skeleton */}
            {!imgLoaded && (
              <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-700" fill="none" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
            )}
            <img
              src={product.image || 'https://via.placeholder.com/600?text=Sin+Imagen'}
              alt={product.name}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-700 hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            {/* Hint de zoom */}
            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              Ampliar
            </div>
          </div>
        </div>

        {/* ── Panel de detalles ── */}
        <div className="w-full lg:w-[48%] p-6 sm:p-10 flex flex-col justify-between gap-6">

          {/* Nombre y precio */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4">
              {product.name}
            </h1>

            <div className="flex items-end gap-3 mb-6">
              <p className="text-4xl sm:text-5xl font-black text-[#FF9980] leading-none">
                ${Number(product.price).toLocaleString('es-AR')}
              </p>
            </div>

            {/* Separador */}
            <div className="h-px bg-gradient-to-r from-[#FF9980]/40 via-gray-600 to-transparent mb-6"></div>

            {/* Descripción */}
            <div>
              <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-3 h-0.5 bg-[#FF9980] inline-block rounded-full"></span>
                Descripción del producto
              </h2>
              <div className="text-gray-300 text-sm sm:text-base leading-relaxed space-y-2">
                {product.description ? (
                  product.description.split('\n').map((line, i) =>
                    line.trim() ? (
                      <p key={i}>{line}</p>
                    ) : (
                      <br key={i} />
                    )
                  )
                ) : (
                  <p className="text-gray-500 italic">
                    Para más información o consultas sobre especificaciones técnicas, no dudes en contactarnos por WhatsApp.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Badges de confianza */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: '✅', label: 'Stock disponible' },
              { icon: '🛡️', label: 'Compra segura' },
              { icon: '📦', label: 'Envío a acordar' },
            ].map((b) => (
              <div key={b.label} className="bg-gray-900/60 border border-gray-700/50 rounded-xl py-2 px-1">
                <span className="block text-lg mb-0.5">{b.icon}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-tight">{b.label}</span>
              </div>
            ))}
          </div>

          {/* Cantidad + botones de acción */}
          <div className="space-y-3">

            {/* Selector cantidad */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Cantidad</span>
              <div className="flex items-center bg-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-inner h-11">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-xl font-black"
                >
                  −
                </button>
                <span className="w-10 font-black text-gray-100 text-center text-base">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-xl font-black"
                >
                  +
                </button>
              </div>
              {quantity > 1 && (
                <span className="text-xs text-gray-500 font-bold">
                  Total: <span className="text-[#FF9980]">${(Number(product.price) * quantity).toLocaleString('es-AR')}</span>
                </span>
              )}
            </div>

            {/* Botón agregar al carrito */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#FF9980] hover:bg-[#ff8060] active:scale-[0.98] text-gray-900 font-black h-14 rounded-2xl text-base transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#FF9980]/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Agregar al Carrito
            </button>

            {/* Botón WhatsApp */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 active:scale-[0.98] text-[#25D366] border border-[#25D366]/30 font-black h-12 rounded-2xl text-sm transition-all flex items-center justify-center gap-2.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Consultar por WhatsApp
            </a>
          </div>

        </div>
      </div>

      {/* Modal de imagen ampliada */}
      {imgZoomed && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setImgZoomed(false)}
        >
          <button
            onClick={() => setImgZoomed(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <img
            src={product.image}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Toast */}
      {addedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-11/12 max-w-sm bg-[#25D366] text-gray-900 px-6 py-4 rounded-2xl shadow-2xl font-black text-sm flex items-center justify-center gap-3 z-50 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span className="truncate flex-grow text-center">¡{quantity > 1 ? `${quantity}x ` : ''}Agregado al carrito!</span>
        </div>
      )}

    </div>
  );
}