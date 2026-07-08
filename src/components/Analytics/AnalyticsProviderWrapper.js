'use client';

import { ShopifyProvider } from '@shopify/hydrogen-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

function PageViewTracker() {
  const { publish } = useAnalytics();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // When pathname or searchParams change, fire a page_viewed event
    publish('page_viewed', {
      url: window.location.href,
    });
  }, [pathname, searchParams, publish]);

  return null;
}

export default function AnalyticsProviderWrapper({ children }) {
  return (
    <ShopifyProvider
      storeDomain={process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}
      storefrontToken={process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN}
      storefrontApiVersion={process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION || '2026-04'}
      countryIsoCode="US"
      languageIsoCode="EN"
    >
      <PageViewTracker />
      {children}
    </ShopifyProvider>
  );
}
