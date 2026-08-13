"use client"; // Le decimos a Next.js que este componente usa interactividad (clics)

import { useCart } from '@/context/CartContext';

export default function AddToCartButton({ product }) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(product);
    // Opcional: Podríamos agregar una pequeña alerta visual o sonido acá en el futuro
  };

  return (
    <button 
      onClick={handleAdd}
      className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-sm active:scale-95"
    >
      Comprar
    </button>
  );
}