import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';

export const metadata = {
  title: 'Polirubroonline.com.ar | Córdoba Capital',
  description: 'Tu tienda polirubro de confianza con envíos desde Córdoba Capital.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      {/* Aplicamos el fondo oscuro estético y letras claras */}
      <body className="bg-gray-900 flex flex-col min-h-screen text-gray-100">
        <CartProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}