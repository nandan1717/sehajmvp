'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginCustomer,
  registerCustomer,
  fetchCustomerDetails,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
  updateCustomerProfile as updateStorefrontProfile
} from '@/lib/shopify/customer';
import { isShopifyConfigured } from '@/lib/shopify/config';
import {
  fetchOAuthCustomerProfile,
  loginWithShopifyOAuth,
  logoutShopifyOAuth,
  getValidToken,
  customerAccountFetch
} from '@/lib/shopify/customer-account-oauth';
import {
  customerAddressCreateMutation as oauthAddressCreateMutation,
  customerAddressUpdateMutation as oauthAddressUpdateMutation,
  customerAddressDeleteMutation as oauthAddressDeleteMutation,
  customerDefaultAddressUpdateMutation as oauthDefaultAddressUpdateMutation
} from '@/lib/shopify/customer-account-queries';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [cards, setCards] = useState([]);

  const clearSession = useCallback(() => {
    localStorage.removeItem('rivaaz_customer_token');
    localStorage.removeItem('rivaaz_customer_avatar');
    localStorage.removeItem('rivaaz_customer_cards');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('rivaaz_auth_provider');
    localStorage.removeItem('checkout_customer_token');
    setUser(null);
    setToken(null);
    setOrders([]);
    setAddresses([]);
    setCards([]);
  }, []);

  // Load user session from localStorage or OAuth session
  const performAuthRestore = useCallback(async () => {
    const authProvider = typeof window !== 'undefined' ? localStorage.getItem('rivaaz_auth_provider') : null;
    const storedAvatar = typeof window !== 'undefined' ? localStorage.getItem('rivaaz_customer_avatar') : null;

    // Step 3 & 4: If logged in via Shopify Customer Account API (OAuth 2.0 + PKCE)
    if (authProvider === 'shopify_oauth') {
      const validToken = await getValidToken();
      if (validToken) {
        setToken(validToken);
        const result = await fetchOAuthCustomerProfile();
        if (result.success && result.customer) {
          const customerData = result.customer;
          setUser({
            ...customerData,
            avatar: storedAvatar || null
          });
          setOrders(customerData.orders || []);
          setAddresses(customerData.addresses || []);

          const savedCards = JSON.parse(localStorage.getItem('rivaaz_customer_cards') || '[]');
          if (savedCards.length === 0) {
            const defaultCards = getInitialCards();
            localStorage.setItem('rivaaz_customer_cards', JSON.stringify(defaultCards));
            setCards(defaultCards);
          } else {
            setCards(savedCards);
          }
          return;
        } else {
          console.warn('OAuth profile fetch failed, clearing session.');
          clearSession();
        }
      } else {
        clearSession();
      }
    }

    // Fallback: Check classic Storefront API token
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('rivaaz_customer_token') : null;
    if (storedToken && isShopifyConfigured) {
      setToken(storedToken);

      const result = await fetchCustomerDetails(storedToken);
      if (result.success && result.customer) {
        const customerData = result.customer;
        setUser({
          id: customerData.id,
          firstName: customerData.firstName || '',
          lastName: customerData.lastName || '',
          email: customerData.email,
          phone: customerData.phone || '',
          defaultAddress: customerData.defaultAddress || null,
          avatar: storedAvatar || null
        });
        setOrders(customerData.orders?.edges?.map(e => e.node) || []);
        setAddresses(customerData.addresses?.edges?.map(e => e.node) || []);
        
        const savedCards = JSON.parse(localStorage.getItem('rivaaz_customer_cards') || '[]');
        setCards(savedCards);
      } else {
        clearSession();
      }
    }
  }, [clearSession]);

  const initializeAuth = useCallback(async () => {
    setLoading(true);
    try {
      await performAuthRestore();
    } catch (err) {
      console.error('Failed to restore auth session:', err);
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [performAuthRestore, clearSession]);

  useEffect(() => {
    const initOnMount = async () => {
      try {
        await performAuthRestore();
      } catch (err) {
        console.error('Failed to restore auth session:', err);
        clearSession();
      } finally {
        setLoading(false);
      }
    };
    initOnMount();
  }, [performAuthRestore, clearSession]);

  const login = async (email, password) => {
    setLoading(true);
    
    if (!isShopifyConfigured) {
      setLoading(false);
      return { success: false, errors: [{ message: 'Shopify Storefront API is not configured.' }] };
    }

    const result = await loginCustomer(email, password);
    if (result.success && result.token) {
      const detailsResult = await fetchCustomerDetails(result.token);
      if (detailsResult.success && detailsResult.customer) {
        const customerData = detailsResult.customer;
        const storedAvatar = localStorage.getItem('rivaaz_customer_avatar');
        const loadedUser = {
          id: customerData.id,
          firstName: customerData.firstName || '',
          lastName: customerData.lastName || '',
          email: customerData.email,
          phone: customerData.phone || '',
          defaultAddress: customerData.defaultAddress || null,
          avatar: storedAvatar || null
        };
        
        localStorage.setItem('rivaaz_customer_token', result.token);
        localStorage.removeItem('rivaaz_auth_provider'); // Mark as legacy provider
        
        setUser(loadedUser);
        setToken(result.token);
        setOrders(customerData.orders?.edges?.map(e => e.node) || []);
        setAddresses(customerData.addresses?.edges?.map(e => e.node) || []);
        
        const savedCards = JSON.parse(localStorage.getItem('rivaaz_customer_cards') || '[]');
        if (savedCards.length === 0) {
          const defaultCards = getInitialCards();
          localStorage.setItem('rivaaz_customer_cards', JSON.stringify(defaultCards));
          setCards(defaultCards);
        } else {
          setCards(savedCards);
        }
        
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, errors: detailsResult.errors || [{ message: 'Failed to fetch customer profile.' }] };
    }

    setLoading(false);
    return { success: false, errors: result.errors || [{ message: 'Invalid email or password.' }] };
  };

  const register = async (firstName, lastName, email, password) => {
    setLoading(true);
    
    if (!isShopifyConfigured) {
      setLoading(false);
      return { success: false, errors: [{ message: 'Shopify Storefront API is not configured.' }] };
    }

    const result = await registerCustomer(firstName, lastName, email, password);
    if (result.success) {
      const loginRes = await login(email, password);
      setLoading(false);
      return loginRes;
    }

    setLoading(false);
    return { success: false, errors: result.errors || [{ message: 'Registration failed.' }] };
  };

  const loginWithGoogle = async (googleUser) => {
    setLoading(true);
    
    if (!isShopifyConfigured) {
      setLoading(false);
      return { success: false, errors: [{ message: 'Shopify Storefront API is not configured.' }] };
    }

    if (googleUser.avatar) {
      localStorage.setItem('rivaaz_customer_avatar', googleUser.avatar);
    }

    const generatedPassword = `GAuth!_${googleUser.email}_Rivaaz2026!`;

    const loginRes = await login(googleUser.email, generatedPassword);
    if (loginRes.success) {
      setLoading(false);
      return { success: true };
    }

    const registerRes = await registerCustomer(
      googleUser.firstName || 'Google',
      googleUser.lastName || 'User',
      googleUser.email,
      generatedPassword
    );

    if (registerRes.success) {
      const secondLoginRes = await login(googleUser.email, generatedPassword);
      setLoading(false);
      return secondLoginRes;
    }

    setLoading(false);
    return {
      success: false,
      errors: registerRes.errors || [
        { message: 'A Shopify account with this email already exists. Please sign in with your email and password first.' }
      ]
    };
  };

  // Step 5: Logout with token revocation
  const logout = async () => {
    setLoading(true);
    await logoutShopifyOAuth(true);
    clearSession();
    setLoading(false);
  };

  const updateProfile = async (fields) => {
    setLoading(true);
    const authProvider = localStorage.getItem('rivaaz_auth_provider');

    // If using OAuth provider
    if (authProvider === 'shopify_oauth') {
      // In Customer Account API, profile is updated or managed in Shopify accounts
      const profileRes = await fetchOAuthCustomerProfile();
      if (profileRes.success && profileRes.customer) {
        setUser(prev => ({
          ...prev,
          ...profileRes.customer
        }));
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, errors: [{ message: 'Profile update via Customer Account API requires Shopify Admin.' }] };
    }

    if (!isShopifyConfigured || !token) {
      setLoading(false);
      return { success: false, errors: [{ message: 'Not authenticated with Shopify.' }] };
    }

    const shopifyFields = {};
    if (fields.firstName) shopifyFields.firstName = fields.firstName;
    if (fields.lastName) shopifyFields.lastName = fields.lastName;
    if (fields.email) shopifyFields.email = fields.email;
    if (fields.phone) shopifyFields.phone = fields.phone;
    if (fields.password) shopifyFields.password = fields.password;

    const result = await updateStorefrontProfile(token, shopifyFields);
    if (result.success && result.customer) {
      setUser(prev => ({
        ...prev,
        id: result.customer.id,
        firstName: result.customer.firstName || '',
        lastName: result.customer.lastName || '',
        email: result.customer.email,
        phone: result.customer.phone || ''
      }));
      setLoading(false);
      return { success: true };
    }
    setLoading(false);
    return { success: false, errors: result.errors || [{ message: 'Profile update failed.' }] };
  };

  const addAddress = async (addressInput) => {
    setLoading(true);
    const authProvider = localStorage.getItem('rivaaz_auth_provider');

    if (authProvider === 'shopify_oauth') {
      const res = await customerAccountFetch({
        query: oauthAddressCreateMutation,
        variables: { address: addressInput }
      });
      if (res.success && !res.errors?.length) {
        const profileRes = await fetchOAuthCustomerProfile();
        if (profileRes.success && profileRes.customer) {
          setAddresses(profileRes.customer.addresses || []);
        }
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, errors: res.errors || [{ message: 'Failed to add address via OAuth.' }] };
    }

    if (!isShopifyConfigured || !token) {
      setLoading(false);
      return { success: false, errors: [{ message: 'Not authenticated with Shopify.' }] };
    }

    const result = await createCustomerAddress(token, addressInput);
    if (result.success && result.address) {
      const detailsResult = await fetchCustomerDetails(token);
      if (detailsResult.success && detailsResult.customer) {
        setAddresses(detailsResult.customer.addresses?.edges?.map(e => e.node) || []);
      }
      setLoading(false);
      return { success: true };
    }
    setLoading(false);
    return { success: false, errors: result.errors || [{ message: 'Failed to add address.' }] };
  };

  const updateAddress = async (addressId, addressInput) => {
    setLoading(true);
    const authProvider = localStorage.getItem('rivaaz_auth_provider');

    if (authProvider === 'shopify_oauth') {
      const res = await customerAccountFetch({
        query: oauthAddressUpdateMutation,
        variables: { addressId, address: addressInput }
      });
      if (res.success && !res.errors?.length) {
        const profileRes = await fetchOAuthCustomerProfile();
        if (profileRes.success && profileRes.customer) {
          setAddresses(profileRes.customer.addresses || []);
        }
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, errors: res.errors || [{ message: 'Failed to update address via OAuth.' }] };
    }

    if (!isShopifyConfigured || !token) {
      setLoading(false);
      return { success: false, errors: [{ message: 'Not authenticated with Shopify.' }] };
    }

    const result = await updateCustomerAddress(token, addressId, addressInput);
    if (result.success && result.address) {
      const detailsResult = await fetchCustomerDetails(token);
      if (detailsResult.success && detailsResult.customer) {
        setAddresses(detailsResult.customer.addresses?.edges?.map(e => e.node) || []);
      }
      setLoading(false);
      return { success: true };
    }
    setLoading(false);
    return { success: false, errors: result.errors || [{ message: 'Failed to update address.' }] };
  };

  const deleteAddress = async (addressId) => {
    setLoading(true);
    const authProvider = localStorage.getItem('rivaaz_auth_provider');

    if (authProvider === 'shopify_oauth') {
      const res = await customerAccountFetch({
        query: oauthAddressDeleteMutation,
        variables: { addressId }
      });
      if (res.success && !res.errors?.length) {
        const profileRes = await fetchOAuthCustomerProfile();
        if (profileRes.success && profileRes.customer) {
          setAddresses(profileRes.customer.addresses || []);
        }
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, errors: res.errors || [{ message: 'Failed to delete address via OAuth.' }] };
    }

    if (!isShopifyConfigured || !token) {
      setLoading(false);
      return { success: false, errors: [{ message: 'Not authenticated with Shopify.' }] };
    }

    const result = await deleteCustomerAddress(token, addressId);
    if (result.success) {
      const detailsResult = await fetchCustomerDetails(token);
      if (detailsResult.success && detailsResult.customer) {
        setAddresses(detailsResult.customer.addresses?.edges?.map(e => e.node) || []);
      }
      setLoading(false);
      return { success: true };
    }
    setLoading(false);
    return { success: false, errors: result.errors || [{ message: 'Failed to delete address.' }] };
  };

  const setDefaultAddress = async (addressId) => {
    setLoading(true);
    const authProvider = localStorage.getItem('rivaaz_auth_provider');

    if (authProvider === 'shopify_oauth') {
      const res = await customerAccountFetch({
        query: oauthDefaultAddressUpdateMutation,
        variables: { addressId }
      });
      if (res.success && !res.errors?.length) {
        const profileRes = await fetchOAuthCustomerProfile();
        if (profileRes.success && profileRes.customer) {
          setAddresses(profileRes.customer.addresses || []);
          setUser(prev => ({
            ...prev,
            defaultAddress: profileRes.customer.defaultAddress
          }));
        }
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, errors: res.errors || [{ message: 'Failed to set default address via OAuth.' }] };
    }

    if (!isShopifyConfigured || !token) {
      setLoading(false);
      return { success: false, errors: [{ message: 'Not authenticated with Shopify.' }] };
    }

    const result = await setDefaultCustomerAddress(token, addressId);
    if (result.success) {
      const detailsResult = await fetchCustomerDetails(token);
      if (detailsResult.success && detailsResult.customer) {
        setAddresses(detailsResult.customer.addresses?.edges?.map(e => e.node) || []);
        setUser(prev => ({
          ...prev,
          defaultAddress: detailsResult.customer.defaultAddress
        }));
      }
      setLoading(false);
      return { success: true };
    }
    setLoading(false);
    return { success: false, errors: result.errors || [{ message: 'Failed to set default address.' }] };
  };

  const addCard = (cardInput) => {
    const newCard = {
      id: `card-${Math.floor(Math.random() * 10000)}`,
      ...cardInput,
      brand: detectCardBrand(cardInput.number)
    };
    const updatedCards = [...cards, newCard];
    setCards(updatedCards);
    localStorage.setItem('rivaaz_customer_cards', JSON.stringify(updatedCards));
    return { success: true };
  };

  const deleteCard = (cardId) => {
    const updatedCards = cards.filter(c => c.id !== cardId);
    setCards(updatedCards);
    localStorage.setItem('rivaaz_customer_cards', JSON.stringify(updatedCards));
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        orders,
        addresses,
        cards,
        login,
        register,
        loginWithGoogle,
        loginWithShopifyOAuth,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        addCard,
        deleteCard,
        restoreSession: initializeAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn('useAuth used outside AuthProvider, returning guest fallback.');
    return {
      user: { id: 'guest', name: 'Guest User', email: '' },
      token: null,
      loading: false,
      orders: [],
      addresses: [],
      cards: [],
      login: async () => ({ success: false }),
      register: async () => ({ success: false }),
      loginWithGoogle: async () => ({ success: false }),
      loginWithShopifyOAuth: async () => ({ success: false }),
      logout: () => {},
      updateProfile: async () => ({ success: false }),
      addAddress: async () => ({ success: false }),
      updateAddress: async () => ({ success: false }),
      deleteAddress: async () => ({ success: false }),
      setDefaultAddress: async () => ({ success: false }),
      addCard: async () => ({ success: false }),
      deleteCard: async () => ({ success: false })
    };
  }
  return context;
}

// Help helpers for initial credit cards in wallet
function getInitialCards() {
  return [
    {
      id: 'card-1',
      number: '•••• •••• •••• 4820',
      holderName: 'Rivaaz Customer',
      expiry: '12/29',
      brand: 'visa',
      theme: 'gold'
    }
  ];
}

function detectCardBrand(number) {
  const cleanNumber = number.replace(/\s+/g, '');
  if (cleanNumber.startsWith('4')) return 'visa';
  if (cleanNumber.startsWith('5')) return 'mastercard';
  if (cleanNumber.startsWith('3')) return 'amex';
  return 'visa'; // Default fallback
}
