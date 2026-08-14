'use client';

import { useState } from 'react';

export default function AdminPage() {
  // Estado para la contraseña de acceso
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  
  // Estados para el formulario del producto
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // La contraseña de tu panel (podés cambiarla por la que quieras)
  const PIN_SECRETO = 'CBAADMIN';

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput === PIN_SECRETO) {
      setIsAuthenticated(true);
    } else {
      alert('PIN incorrecto. Acceso denegado.');
      setPinInput('');
    }
  };

  const handleCargarProducto = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Convertimos el precio a número
    const numericPrice = Number(price);

    try {
      const response = await fetch('/api/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          price: numericPrice,
          category: category.toUpperCase().trim(),
          image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar el producto');
      }

      // Si salió bien, mostramos mensaje de éxito y limpiamos el formulario
      setMessage({ type: 'success', text: `¡${name} se cargó correctamente en la tienda!` });
      setName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setImage('');

    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-700 w-full max-w-md text-center">
          <span className="text-5xl block mb-4">🔐</span>
          <h1 className="text-2xl font-black text-[#FF9980] mb-6">Acceso Restringido</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Ingresá el PIN de administrador"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-xl p-4 text-center focus:outline-none focus:border-[#FF9980]"
            />
            <button 
              type="submit"
              className="w-full bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-4 rounded-xl transition-all"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Pantalla del Panel de Control
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 mt-4">
      <div className="mb-8 border-b border-gray-700 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#FF9980] drop-shadow-lg">
            Panel de Control
          </h1>
          <p className="text-gray-400 mt-2">Cargá nuevos productos a tu base de datos al instante.</p>
        </div>
        <span className="bg-red-500/20 text-red-400 font-bold px-3 py-1 rounded-full text-sm border border-red-500/30">
          Modo Admin
        </span>
      </div>

      <div className="bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-700">
        <form onSubmit={handleCargarProducto} className="flex flex-col gap-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 font-bold mb-2">Nombre del Producto</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Teclado Mecánico..." 
                className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-lg p-3 focus:outline-none focus:border-[#FF9980]"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 font-bold mb-2">Precio (Sin signos, solo números)</label>
              <input 
                type="number" 
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ej: 95000" 
                className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-lg p-3 focus:outline-none focus:border-[#FF9980]"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-2">Categoría</label>
              <input 
                type="text" 
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej: TECNOLOGÍA" 
                className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-lg p-3 focus:outline-none focus:border-[#FF9980] uppercase"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-2">Link de la Imagen (URL)</label>
              <input 
                type="url" 
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..." 
                className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-lg p-3 focus:outline-none focus:border-[#FF9980]"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-bold mb-2">Descripción</label>
            <textarea 
              required
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles técnicos, materiales, etc..." 
              className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-lg p-3 focus:outline-none focus:border-[#FF9980] resize-none"
            ></textarea>
          </div>

          {message && (
            <div className={`p-4 rounded-xl font-bold text-center border ${
              message.type === 'success' 
                ? 'bg-green-900/30 text-green-400 border-green-500/50' 
                : 'bg-red-900/30 text-red-400 border-red-500/50'
            }`}>
              {message.type === 'success' ? '✅ ' : '⚠️ '} {message.text}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-[#FF9980] hover:bg-[#ff8060] disabled:bg-gray-600 text-gray-900 font-black text-xl py-4 rounded-xl shadow-lg transition-all"
          >
            {loading ? 'Guardando en la base de datos...' : 'Publicar Producto'}
          </button>
        </form>
      </div>
    </div>
  );
}