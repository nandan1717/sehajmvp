'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { SUPPORTED_COUNTRIES, DEFAULT_COUNTRY, COUNTRY_COOKIE_NAME } from '@/lib/shopify/config';
import { updateCartBuyerIdentity } from '@/lib/shopify/cart-actions';

const CountryContext = createContext(null);

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function setCookie(name, value, days = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value};path=/;expires=${expires};samesite=lax`;
}

export function CountryProvider({ children, initialCountry }) {
  const [countryCode, setCountryCodeState] = useState(
    () => initialCountry || getCookie(COUNTRY_COOKIE_NAME) || DEFAULT_COUNTRY
  );

  const currentCountry = SUPPORTED_COUNTRIES.find(c => c.code === countryCode) ||
    SUPPORTED_COUNTRIES[0];

  const setCountryCode = useCallback(async (code) => {
    const validCountry = SUPPORTED_COUNTRIES.find(c => c.code === code);
    if (!validCountry) return;

    setCountryCodeState(code);
    setCookie(COUNTRY_COOKIE_NAME, code);

    // Update cart with new buyer identity if they have one
    await updateCartBuyerIdentity(code);

    // Reload so server components re-fetch with the new country context
    window.location.reload();
  }, []);

  return (
    <CountryContext.Provider
      value={{
        countryCode,
        currentCountry,
        setCountryCode,
        supportedCountries: SUPPORTED_COUNTRIES,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
}
