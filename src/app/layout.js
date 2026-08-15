import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import WhatsAppButton from '@/components/WhatsAppButton'; // <-- Importamos tu nuevo botón

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
          
          <Navbar />
          
          <main className="flex-grow">
            {children}
          </main>
          
          <footer className="bg-[#FF9980] border-t border-[#ff8060] py-8 text-center mt-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <p className="text-gray-900 font-black text-xl mb-1">
              © {new Date().getFullYear()} Polirubro Online.cba
            </p>
            <p className="text-gray-800 font-bold flex items-center justify-center gap-2">
              <span>📍</span> Centro de operaciones en Córdoba Capital
            </p>
          </footer>
          
          {/* El botón de WhatsApp flotando por encima de todo */}
          <WhatsAppButton />
          
        </CartProvider>
      </body>
    </html>
  );
}