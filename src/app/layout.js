import { Playfair_Display, Inter } from 'next/font/google';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import CartShell from '@/components/Cart/CartShell';
import { CartProvider } from '@/context/CartContext';
import { getCart } from '@/lib/shopify/cart-actions';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Rivaaz | Enduring Elegance',
  description: 'Bespoke Indian suits and premium shawls.',
};

export default async function RootLayout({ children }) {
  const cart = await getCart();

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <CartProvider initialCart={cart}>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartShell />
        </CartProvider>
      </body>
    </html>
  );
}
