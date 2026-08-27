export default function ProductCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 flex flex-col h-full animate-pulse">
      {/* Imagen skeleton */}
      <div className="h-56 bg-gray-700 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
      </div>

      {/* Contenido skeleton */}
      <div className="p-5 flex flex-col flex-grow gap-3">
        {/* Badge categoria */}
        <div className="h-3 w-20 bg-gray-700 rounded-full" />
        {/* Titulo */}
        <div className="h-5 w-3/4 bg-gray-700 rounded-lg" />
        <div className="h-5 w-1/2 bg-gray-700 rounded-lg" />
        {/* Descripcion */}
        <div className="h-3 w-full bg-gray-700 rounded-full mt-1" />
        <div className="h-3 w-4/5 bg-gray-700 rounded-full" />
        <div className="h-3 w-2/3 bg-gray-700 rounded-full" />

        {/* Precio y boton */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-700">
          <div className="h-7 w-24 bg-gray-700 rounded-lg" />
          <div className="h-9 w-9 bg-gray-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
