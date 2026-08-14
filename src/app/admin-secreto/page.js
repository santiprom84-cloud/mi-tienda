'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminPage() {
  // Estados para carga individual
  const [product, setProduct] = useState({
    name: '',
    price: '',
    image: '',
    category: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Estados para carga masiva (Excel)
  const [excelData, setExcelData] = useState('');
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');

  // FUNCIÓN 1: Subir un solo producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const cleanPrice = Number(product.price.replace(/[^0-9]/g, ''));
      const { data, error } = await supabase
        .from('productos')
        .insert([
          {
            name: product.name,
            price: cleanPrice,
            image: product.image,
            category: product.category.toUpperCase(),
            description: product.description
          }
        ]);

      if (error) throw error;

      setMessage('✅ Producto publicado con éxito.');
      setProduct({ name: '', price: '', image: '', category: '', description: '' });
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // FUNCIÓN 2: Carga Masiva desde Excel
  const handleBulkSubmit = async () => {
    if (!excelData.trim()) {
      setBulkMessage('⚠️ Pegá los datos de tu Excel primero.');
      return;
    }

    setIsBulkSubmitting(true);
    setBulkMessage('');

    try {
      // Separamos por salto de línea (cada fila de Excel)
      const rows = excelData.trim().split('\n');
      
      const productsToAdd = rows.map((row, index) => {
        // Al copiar de Excel, los datos vienen separados por una tabulación (\t)
        const columns = row.split('\t');
        
        // Verificamos que tenga las 5 columnas
        if (columns.length < 5) {
          throw new Error(`La fila ${index + 1} no tiene las 5 columnas requeridas.`);
        }

        return {
          name: columns[0].trim(),
          price: Number(columns[1].replace(/[^0-9]/g, '')), // Limpiamos signos $
          image: columns[2].trim(),
          category: columns[3].trim().toUpperCase(),
          description: columns[4].trim()
        };
      });

      // Insertamos todo el bloque junto en Supabase
      const { data, error } = await supabase
        .from('productos')
        .insert(productsToAdd);

      if (error) throw error;

      setBulkMessage(`✅ ¡Éxito! Se cargaron ${productsToAdd.length} productos de golpe.`);
      setExcelData(''); // Limpiamos la caja
    } catch (error) {
      setBulkMessage(`❌ Error en la carga masiva: ${error.message}`);
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 mt-4">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#FF9980] mb-2">Panel de Control</h1>
          <p className="text-gray-400">Gestioná el inventario de tu base de datos al instante.</p>
        </div>
        <Link href="/" className="text-gray-400 hover:text-white underline">
          Volver a la tienda
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUMNA 1: Carga Masiva por Excel */}
        <div className="bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-black text-gray-100 mb-2 flex items-center gap-2">
            <span>⚡</span> Carga Masiva (Desde Excel)
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Copiá las celdas de tu Excel y pegalas en la caja. <br/>
            <strong className="text-[#FF9980]">Orden obligatorio:</strong> Nombre | Precio | Link Imagen | Categoría | Descripción
          </p>

          <textarea 
            value={excelData}
            onChange={(e) => setExcelData(e.target.value)}
            className="w-full h-64 bg-gray-900 border border-gray-600 rounded-xl p-4 text-gray-100 focus:outline-none focus:border-[#FF9980] transition-colors resize-none font-mono text-sm whitespace-pre"
            placeholder="Pegá acá las filas de tu Excel..."
          />

          <button 
            onClick={handleBulkSubmit}
            disabled={isBulkSubmitting}
            className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white font-black py-4 rounded-xl transition-all shadow-md disabled:opacity-50"
          >
            {isBulkSubmitting ? 'Procesando masivamente...' : 'Cargar Excel a la Base de Datos'}
          </button>

          {bulkMessage && (
            <div className={`mt-4 p-4 rounded-xl text-center font-bold ${bulkMessage.includes('✅') ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
              {bulkMessage}
            </div>
          )}
        </div>

        {/* COLUMNA 2: Carga Individual (La que ya tenías) */}
        <div className="bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-black text-gray-100 mb-6 flex items-center gap-2">
            <span>✏️</span> Carga Individual
          </h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 font-bold mb-2 text-sm">Nombre del Producto</label>
                <input 
                  type="text" 
                  required
                  value={product.name}
                  onChange={(e) => setProduct({...product, name: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980]"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold mb-2 text-sm">Precio (solo números)</label>
                <input 
                  type="number" 
                  required
                  value={product.price}
                  onChange={(e) => setProduct({...product, price: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980]"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 font-bold mb-2 text-sm">Link de la Imagen (URL)</label>
              <input 
                type="url" 
                required
                value={product.image}
                onChange={(e) => setProduct({...product, image: e.target.value})}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980]"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-bold mb-2 text-sm">Categoría</label>
              <input 
                type="text" 
                required
                value={product.category}
                onChange={(e) => setProduct({...product, category: e.target.value})}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980] uppercase"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-bold mb-2 text-sm">Descripción</label>
              <textarea 
                required
                rows="3"
                value={product.description}
                onChange={(e) => setProduct({...product, description: e.target.value})}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-[#FF9980] resize-none"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#FF9980] hover:bg-[#ff8060] text-gray-900 font-black py-4 rounded-xl shadow-md transition-all mt-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar Producto Individual'}
            </button>

            {message && (
              <div className={`mt-2 p-4 rounded-xl text-center font-bold ${message.includes('✅') ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                {message}
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}