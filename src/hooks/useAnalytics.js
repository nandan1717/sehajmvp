import { useCallback } from 'react';
import { sendShopifyAnalytics, getClientBrowserParameters, AnalyticsEventName } from '@shopify/hydrogen-react';

export function useAnalytics() {
  const publish = useCallback((eventName, payload) => {
    let mappedEventName = eventName;
    if (eventName === 'page_viewed') mappedEventName = AnalyticsEventName.PAGE_VIEW;
    if (eventName === 'product_added_to_cart') mappedEventName = AnalyticsEventName.ADD_TO_CART;
    
    // Fallbacks for other events if they exist in AnalyticsEventName
    if (eventName === 'product_viewed' && AnalyticsEventName.PRODUCT_VIEW) {
      mappedEventName = AnalyticsEventName.PRODUCT_VIEW;
    }

    try {
      const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN 
        ? `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}` 
        : undefined;

      sendShopifyAnalytics({
        eventName: mappedEventName,
        payload: {
          hasUserConsent: true,
          shopId: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID ? `gid://shopify/Shop/${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID}` : 'gid://shopify/Shop/1',
          currency: 'CAD',
          ...getClientBrowserParameters(),
          ...payload
        }
      }, shopDomain).catch(err => {
        // Analytics can fail due to adblockers, privacy extensions, or network errors.
        // We catch it here to prevent unhandled promise rejections.
        console.warn('Analytics event failed to send:', err.message || err);
      });
    } catch (e) {
      console.error('Analytics error:', e);
    }
  }, []);

  return { publish };
}
