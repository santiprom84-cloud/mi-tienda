import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';

export const metadata = {
  title: 'Polirubro Online.cba | Córdoba Capital',
  description: 'Tu tienda polirubro de confianza con envíos desde Córdoba Capital. Todo lo que buscas en un solo lugar.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 flex flex-col min-h-screen">
        {/* Envolvemos todo en el CartProvider para que el carrito funcione */}
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