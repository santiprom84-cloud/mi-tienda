"use client"; // Le decimos a Next.js que este componente usa interactividad (clics)

import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleBuy = () => {
    addToCart(product);
    // Acá más adelante podemos sumar una notificación visual tipo "¡Producto agregado!"
  };

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
      <div className="relative h-56 w-full overflow-hidden bg-slate-200">
        <img 
          src={product.image_url || 'https://via.placeholder.com/600'} 
          alt={product.name} 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">
          {product.category}
        </span>
        <h2 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">
          {product.name}
        </h2>
        <p className="text-slate-500 text-sm mb-6 line-clamp-2">
          {product.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-2xl font-extrabold text-slate-900">
            ${Number(product.price).toLocaleString('es-AR')}
          </span>
          <button 
            onClick={handleBuy}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-sm active:scale-95"
          >
            Comprar
          </button>
        </div>
      </div>
    </article>
  );
}