import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Polirubro Online.cba | Córdoba Capital',
  description: 'Tu tienda polirubro de confianza con envíos desde Córdoba Capital. Todo lo que buscas en un solo lugar.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 flex flex-col min-h-screen">
        <Navbar />
        {/* El main toma el espacio disponible para empujar el footer hacia abajo */}
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}