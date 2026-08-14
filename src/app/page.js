import ProductCard from '@/components/ProductCard';

// Catálogo de prueba con precios en $100 para testear pasarela de pagos
const dummyProducts = [
  {
    id: '1',
    name: 'Teclado Mecánico TKL Creamy',
    description: 'Teclado formato TKL con switches lineales cremosos. Ideal para tipear y jugar al máximo nivel.',
    price: 100, // Precio de prueba
    category: 'TECNOLOGÍA',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'Camiseta Oficial Talleres',
    description: 'Camiseta titular. Tela transpirable de alta tecnología y escudo termosellado.',
    price: 100, // Precio de prueba
    category: 'INDUMENTARIA',
    image: 'https://images.unsplash.com/photo-1508344928928-7137b2938833?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'Volante Sim Racing',
    description: 'Volante con Force Feedback de alta precisión para disfrutar al máximo en simuladores de carreras.',
    price: 100, // Precio de prueba
    category: 'GAMING',
    image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=600&auto=format&fit=crop'
  }
];

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 mt-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-[#FF9980] mb-4 drop-shadow-sm">
          Polirubro Online
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Explorá nuestro catálogo completo. Los mejores productos actualizados en tiempo real.
        </p>
      </div>
      
      {/* Grilla de productos adaptada a tu diseño */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {dummyProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}