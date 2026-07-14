import { Playfair_Display, Inter } from 'next/font/google';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import CartShell from '@/components/Cart/CartShell';
import AnalyticsProviderWrapper from '@/components/Analytics/AnalyticsProviderWrapper';
import { Suspense } from 'react';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { getCart } from '@/lib/shopify/cart-actions';
import { getShopName } from '@/lib/shopify/client';
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

export async function generateMetadata() {
  const shopName = await getShopName();
  return {
    title: `${shopName} | Enduring Elegance`,
    description: 'Bespoke Indian suits and premium shawls.',
  };
}

export default async function RootLayout({ children }) {
  const [cart, shopName] = await Promise.all([
    getCart(),
    getShopName(),
  ]);

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <Suspense fallback={null}>
          <AnalyticsProviderWrapper>
            <AuthProvider>
              <CartProvider initialCart={cart}>
                <Navbar shopName={shopName} />
                <main>{children}</main>
                <Footer shopName={shopName} />
                <CartShell />
              </CartProvider>
            </AuthProvider>
          </AnalyticsProviderWrapper>
        </Suspense>
      </body>
    </html>
  );
}
