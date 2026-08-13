import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

export default async function Home() {
  // Pedimos los datos a Supabase desde el servidor
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error detallado de Supabase:", error);
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-red-700 shadow-sm max-w-md text-center">
          <h2 className="font-bold text-xl mb-2">Error de conexión</h2>
          <p className="text-sm">No se pudieron cargar los productos. Verificá que la URL en .env.local esté correcta.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            DevTienda <span className="text-blue-600">Polirubro</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Explorá nuestro catálogo completo. Los mejores productos actualizados en tiempo real.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {/* Iteramos sobre los productos y pasamos cada uno al componente visual */}
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </main>
  );
}