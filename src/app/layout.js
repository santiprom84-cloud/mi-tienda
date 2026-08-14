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
      {/* Acá aplicamos un color salmón un poquito más claro para el fondo (bg-[#FFB099]) */}
      <body className="bg-[#FFB099] flex flex-col min-h-screen text-gray-900">
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