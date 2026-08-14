import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Polirubro Online | Córdoba Capital',
  description: 'Encontrá tecnología, indumentaria, gaming y mucho más. Operamos 100% online con despachos desde Córdoba Capital.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen flex flex-col`}>
        <CartProvider>
          {/* El Navbar ahora aparecerá en absolutamente todas las páginas */}
          <Navbar />
          
          {/* El contenido dinámico de cada página (Inicio, Carrito, etc.) */}
          <main className="flex-grow">
            {children}
          </main>
          
          {/* Footer minimalista y universal */}
          <footer className="bg-gray-950 border-t border-gray-800 py-8 text-center mt-auto">
            <p className="text-gray-500 font-medium">
              © {new Date().getFullYear()} Polirubro Online.cba - Córdoba Capital
            </p>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}