import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartSidebar from "@/components/CartSidebar";

export const metadata = {
  title: "DevTienda Polirubro",
  description: "Tu tienda online con los mejores productos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 antialiased flex flex-col min-h-screen">
        <CartProvider>
          <Navbar />
          
          {/* Añadimos el componente del carrito lateral aquí */}
          <CartSidebar />
          
          <div className="flex-grow">
            {children}
          </div>
        </CartProvider>
      </body>
    </html>
  );
}