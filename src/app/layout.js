import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import ToastContainer from '@/components/ToastContainer';
import Navbar from '@/components/Navbar';
import WhatsAppButton from '@/components/WhatsAppButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Polirubro Online | Córdoba Capital',
  description: 'Encontrá tecnología, indumentaria, gaming y mucho más. Operamos 100% online con despachos desde Córdoba Capital.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen flex flex-col`}>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              
              <Navbar />
              
              <main className="flex-grow">
                <Suspense>
                  {children}
                </Suspense>
              </main>
            
            <footer className="bg-[#FF9980] border-t border-[#ff8060] py-6 sm:py-8 text-center mt-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              <p className="text-gray-900 font-black text-lg sm:text-xl mb-1">
                © {new Date().getFullYear()} Polirubro Online.cba
              </p>
              <p className="text-gray-800 font-bold flex items-center justify-center gap-2 text-sm sm:text-base">
                <span>📍</span> Centro de operaciones en Córdoba Capital
              </p>
            </footer>
            
              <WhatsAppButton />
              <ToastContainer />
              
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}