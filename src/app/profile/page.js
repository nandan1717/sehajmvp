'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function ProfilePage() {
  const {
    user,
    token,
    loading,
    orders,
    addresses,
    cards,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    addCard,
    deleteCard
  } = useAuth();

  const router = useRouter();
  const googleInitialized = useRef(false);

  // Authentication states
  const [isRegister, setIsRegister] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFirstName, setAuthFirstName] = useState('');
  const [authLastName, setAuthLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || user) return;

    const handleCredentialResponse = async (response) => {
      try {
        const token = response.credential;
        const decoded = decodeJwt(token);
        if (decoded) {
          setAuthSubmitting(true);
          const res = await loginWithGoogle({
            firstName: decoded.given_name || 'Google',
            lastName: decoded.family_name || 'User',
            email: decoded.email,
            avatar: decoded.picture
          });
          if (res && res.success) {
            router.push('/profile');
            router.refresh();
          }
        } else {
          setAuthError('Failed to parse Google credentials.');
        }
      } catch (err) {
        setAuthError('Google sign in failed.');
      } finally {
        setAuthSubmitting(false);
      }
    };

    const renderGoogleButton = () => {
      if (window.google) {
        if (!googleInitialized.current) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse
          });
          googleInitialized.current = true;
        }

        const targetDiv = document.getElementById('google-signin-btn');
        if (targetDiv) {
          window.google.accounts.id.renderButton(targetDiv, {
            theme: 'outline',
            size: 'large',
            width: 320,
            shape: 'pill',
            text: 'continue_with',
            logo_alignment: 'left'
          });
        }
      }
    };

    if (window.google) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      renderGoogleButton();
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [user, isRegister, loginWithGoogle]);

  // Active dashboard tab
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, orders, addresses, cards



  // Address form states
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressFormId, setAddressFormId] = useState(null);
  const [addressFormFirstName, setAddressFormFirstName] = useState('');
  const [addressFormLastName, setAddressFormLastName] = useState('');
  const [addressFormPhone, setAddressFormPhone] = useState('');
  const [addressFormStreet1, setAddressFormStreet1] = useState('');
  const [addressFormStreet2, setAddressFormStreet2] = useState('');
  const [addressFormCity, setAddressFormCity] = useState('');
  const [addressFormProvince, setAddressFormProvince] = useState('');
  const [addressFormZip, setAddressFormZip] = useState('');
  const [addressFormCountry, setAddressFormCountry] = useState('India');
  const [addressError, setAddressError] = useState('');
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  // Card form states
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardFormNumber, setCardFormNumber] = useState('');
  const [cardFormHolder, setCardFormHolder] = useState('');
  const [cardFormExpiry, setCardFormExpiry] = useState('');
  const [cardFormCvv, setCardFormCvv] = useState('');
  const [cardFormTheme, setCardFormTheme] = useState('gold');
  const [cardError, setCardError] = useState('');

  // Expanded Order tracking state
  const [expandedOrderId, setExpandedOrderId] = useState(null);



  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className="serif">Restoring Elegance...</p>
      </div>
    );
  }

  // Handle Login & Registration Submit
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);

    try {
      if (isRegister) {
        if (!authFirstName || !authLastName) {
          throw new Error('Please fill in your name details.');
        }
        if (authPassword.length < 8) {
          throw new Error('Password must be at least 8 characters long.');
        }
        const result = await register(authFirstName, authLastName, authEmail, authPassword);
        if (!result.success) {
          throw new Error(result.errors?.[0]?.message || 'Registration failed.');
        }
        router.push('/profile');
        router.refresh();
      } else {
        const result = await login(authEmail, authPassword);
        if (!result.success) {
          throw new Error(result.errors?.[0]?.message || 'Invalid email or password.');
        }
        router.push('/profile');
        router.refresh();
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthSubmitting(false);
    }
  };



  // Handle Address Submit (Create/Update)
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressError('');
    setAddressSubmitting(true);

    const addressInput = {
      firstName: addressFormFirstName,
      lastName: addressFormLastName,
      phone: addressFormPhone,
      address1: addressFormStreet1,
      address2: addressFormStreet2,
      city: addressFormCity,
      province: addressFormProvince,
      zip: addressFormZip,
      country: addressFormCountry
    };

    try {
      let result;
      if (addressFormId) {
        result = await updateAddress(addressFormId, addressInput);
      } else {
        result = await addAddress(addressInput);
      }

      if (result.success) {
        resetAddressForm();
      } else {
        throw new Error(result.errors?.[0]?.message || 'Address save failed.');
      }
    } catch (err) {
      setAddressError(err.message);
    } finally {
      setAddressSubmitting(false);
    }
  };

  const startEditAddress = (addr) => {
    setAddressFormId(addr.id);
    setAddressFormFirstName(addr.firstName || '');
    setAddressFormLastName(addr.lastName || '');
    setAddressFormPhone(addr.phone || '');
    setAddressFormStreet1(addr.address1 || '');
    setAddressFormStreet2(addr.address2 || '');
    setAddressFormCity(addr.city || '');
    setAddressFormProvince(addr.province || '');
    setAddressFormZip(addr.zip || '');
    setAddressFormCountry(addr.country || 'India');
    setIsEditingAddress(true);
    setAddressError('');
  };

  const resetAddressForm = () => {
    setAddressFormId(null);
    setAddressFormFirstName('');
    setAddressFormLastName('');
    setAddressFormPhone('');
    setAddressFormStreet1('');
    setAddressFormStreet2('');
    setAddressFormCity('');
    setAddressFormProvince('');
    setAddressFormZip('');
    setAddressFormCountry('India');
    setIsEditingAddress(false);
    setAddressError('');
  };

  // Handle Card Submit
  const handleCardSubmit = (e) => {
    e.preventDefault();
    setCardError('');

    if (cardFormNumber.replace(/\s+/g, '').length < 15) {
      setCardError('Invalid card number.');
      return;
    }
    if (!cardFormHolder) {
      setCardError('Cardholder name is required.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardFormExpiry)) {
      setCardError('Expiry date must be in MM/YY format.');
      return;
    }
    if (cardFormCvv.length < 3) {
      setCardError('CVV must be 3 or 4 digits.');
      return;
    }

    // Format card number to have bullets except last 4 digits
    const rawNumber = cardFormNumber.replace(/\s+/g, '');
    const maskedNumber = `•••• •••• •••• ${rawNumber.slice(-4)}`;

    const result = addCard({
      number: maskedNumber,
      holderName: cardFormHolder,
      expiry: cardFormExpiry,
      theme: cardFormTheme
    });

    if (result.success) {
      setCardFormNumber('');
      setCardFormHolder('');
      setCardFormExpiry('');
      setCardFormCvv('');
      setCardFormTheme('gold');
      setIsAddingCard(false);
    }
  };

  // Formatting utilities for forms
  const formatCardNumberInput = (val) => {
    const clean = val.replace(/\D/g, '').substring(0, 16);
    const groups = clean.match(/.{1,4}/g);
    setCardFormNumber(groups ? groups.join(' ') : clean);
  };

  const formatExpiryInput = (val) => {
    const clean = val.replace(/\D/g, '').substring(0, 4);
    if (clean.length > 2) {
      setCardFormExpiry(`${clean.substring(0, 2)}/${clean.substring(2, 4)}`);
    } else {
      setCardFormExpiry(clean);
    }
  };

  const getOrderStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED': return styles.statusDelivered;
      case 'FULFILLED': return styles.statusShipped;
      case 'SHIPPED': return styles.statusShipped;
      case 'PROCESSING': return styles.statusProcessing;
      default: return styles.statusPending;
    }
  };

  // If NOT Logged In, Render Auth Gate
  if (!user) {
    return (
      <div className={`container ${styles.authContainer}`}>
        <div className={`glass-bento ${styles.authCard}`}>
          <div className={styles.authTabs}>
            <button
              className={`${styles.authTab} ${!isRegister ? styles.activeAuthTab : ''} serif`}
              onClick={() => { setIsRegister(false); setAuthError(''); }}
            >
              Sign In
            </button>
            <button
              className={`${styles.authTab} ${isRegister ? styles.activeAuthTab : ''} serif`}
              onClick={() => { setIsRegister(true); setAuthError(''); }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className={styles.authForm}>
            {authError && <div className={styles.errorMessage}>{authError}</div>}

            {isRegister && (
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="first-name">First Name</label>
                  <input
                    type="text"
                    id="first-name"
                    value={authFirstName}
                    onChange={(e) => setAuthFirstName(e.target.value)}
                    required
                    maxLength="50"
                    placeholder="Enter first name"
                    autoComplete="given-name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="last-name">Last Name</label>
                  <input
                    type="text"
                    id="last-name"
                    value={authLastName}
                    onChange={(e) => setAuthLastName(e.target.value)}
                    required
                    maxLength="50"
                    placeholder="Enter last name"
                    autoComplete="family-name"
                  />
                </div>
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                placeholder="email@example.com"
                autoComplete="username"
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelWithAction}>
                <label htmlFor="password">Password</label>
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={authSubmitting}>
              {authSubmitting ? 'Processing...' : isRegister ? 'Register' : 'Access Account'}
            </button>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
              <div className={styles.googleBtnContainer}>
                <div id="google-signin-btn"></div>
              </div>
            ) : (
              <div className={styles.googleConfigWarning}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', flexShrink: 0 }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <div style={{ textAlign: 'left' }}>
                  <strong style={{ fontSize: '0.85rem' }}>Google Login Pending Setup</strong>
                  <p style={{ fontSize: '0.75rem', marginTop: '2px', opacity: 0.8, lineHeight: 1.4 }}>
                    Add <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to <code>.env.local</code>.
                  </p>
                </div>
              </div>
            )}
          </form>

        </div>
      </div>
    );
  }

  // Logged In Dashboard Render
  return (
    <div className={`container ${styles.dashboardContainer}`}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user.avatar ? (
            <div className={styles.avatarWrapper}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar}
                alt="Avatar"
                className={styles.avatar}
              />
            </div>
          ) : null}
          <div>
            <h1 className="serif">Nilaash</h1>
            <p className={styles.welcomeText}>
              Welcome back, {user.firstName}!
            </p>
          </div>
        </div>
        <button onClick={logout} className="btn-outline" style={{ padding: '8px 20px', fontSize: '0.8rem', borderRadius: '8px' }}>
          Sign Out
        </button>
      </div>

      <div className={styles.dashboardGrid}>
        {/* Navigation Sidebar */}
        <aside className={`glass-bento ${styles.sidebar}`}>
          <button
            className={`${styles.sidebarLink} ${activeTab === 'dashboard' ? styles.activeSidebarLink : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="9" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="16" width="7" height="5" rx="1"></rect></svg>
            Dashboard
          </button>
          <button
            className={`${styles.sidebarLink} ${activeTab === 'orders' ? styles.activeSidebarLink : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            My Orders
            {orders.length > 0 && <span className={styles.sidebarBadge}>{orders.length}</span>}
          </button>
          <button
            className={`${styles.sidebarLink} ${activeTab === 'addresses' ? styles.activeSidebarLink : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            Addresses
            {addresses.length > 0 && <span className={styles.sidebarBadge}>{addresses.length}</span>}
          </button>
          <button
            className={`${styles.sidebarLink} ${activeTab === 'cards' ? styles.activeSidebarLink : ''}`}
            onClick={() => setActiveTab('cards')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            Saved Cards
            {cards.length > 0 && <span className={styles.sidebarBadge}>{cards.length}</span>}
          </button>
        </aside>

        {/* Content Pane */}
        <main className={styles.mainContent}>
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className={styles.tabPane}>
              {/* Stats Bento */}
              <div className={styles.statsGrid}>
                <div className={`glass-bento ${styles.statCard}`}>
                  <h3 className="serif">Total Orders</h3>
                  <div className={styles.statNumber}>{orders.length}</div>
                  <button onClick={() => setActiveTab('orders')} className={styles.statLink}>
                    View history &rarr;
                  </button>
                </div>
                <div className={`glass-bento ${styles.statCard}`}>
                  <h3 className="serif">Primary Address</h3>
                  <div className={styles.statAddress}>
                    {addresses.length > 0 ? (
                      <>
                        <p className={styles.bold}>{addresses[0].firstName} {addresses[0].lastName}</p>
                        <p>{addresses[0].address1}, {addresses[0].city}</p>
                      </>
                    ) : (
                      <p className={styles.muted}>No address saved yet</p>
                    )}
                  </div>
                  <button onClick={() => setActiveTab('addresses')} className={styles.statLink}>
                    Manage addresses &rarr;
                  </button>
                </div>
                <div className={`glass-bento ${styles.statCard}`}>
                  <h3 className="serif">Saved Methods</h3>
                  <div className={styles.statNumber}>{cards.length}</div>
                  <button onClick={() => setActiveTab('cards')} className={styles.statLink}>
                    Manage cards &rarr;
                  </button>
                </div>
              </div>

              {/* Profile Details Form */}
              <ProfileDetailsForm user={user} updateProfile={updateProfile} styles={styles} />
            </div>
          )}

          {/* TAB 2: MY ORDERS & TRACKING TIMELINE */}
          {activeTab === 'orders' && (
            <div className={styles.tabPane}>
              <h2 className="serif" style={{ marginBottom: '24px' }}>Order History</h2>

              {orders.length === 0 ? (
                <div className={`glass-bento ${styles.emptyCard}`}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '16px', opacity: 0.5 }}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                  <p className={styles.muted}>You haven&apos;t placed any orders yet.</p>
                  <Link href="/collections/all" className="btn-primary" style={{ marginTop: '16px' }}>
                    Shop Collection
                  </Link>
                </div>
              ) : (
                <div className={styles.ordersList}>
                  {orders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;
                    const items = order.lineItems?.edges || [];
                    const formattedDate = new Date(order.processedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });

                    // Determine tracking stage: 0 = Ordered, 1 = Processing, 2 = Shipped, 3 = Delivered
                    let trackingStage = 1; // Default Processing
                    const status = order.fulfillmentStatus?.toUpperCase();
                    if (status === 'DELIVERED') trackingStage = 3;
                    else if (status === 'SHIPPED' || status === 'FULFILLED') trackingStage = 2;

                    return (
                      <div key={order.id} className={`glass-bento ${styles.orderCard} ${isExpanded ? styles.expandedCard : ''}`}>
                        <div className={styles.orderSummary} onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}>
                          <div className={styles.orderMeta}>
                            <span className={styles.orderNumber}>Order #{order.orderNumber || order.id.slice(-4)}</span>
                            <span className={styles.orderDate}>{formattedDate}</span>
                          </div>

                          <div className={styles.orderSpecs}>
                            <span className={styles.orderTotal}>
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: order.totalPrice?.currencyCode || 'USD'
                              }).format(order.totalPrice?.amount || 0)}
                            </span>
                            <span className={`${styles.statusBadge} ${getOrderStatusClass(order.fulfillmentStatus)}`}>
                              {order.fulfillmentStatus || 'Processing'}
                            </span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`${styles.chevron} ${isExpanded ? styles.rotatedChevron : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className={styles.orderDetails}>
                            {/* Tracking Timeline */}
                            <div className={styles.trackingTimelineContainer}>
                              <h4 className="serif">Tracking Status</h4>
                              <div className={styles.timeline}>
                                <div className={`${styles.timelineStep} ${trackingStage >= 0 ? styles.stepDone : ''}`}>
                                  <div className={styles.stepMarker}>1</div>
                                  <div className={styles.stepLabel}>Placed</div>
                                </div>
                                <div className={`${styles.timelineConnector} ${trackingStage >= 1 ? styles.connectorDone : ''}`}></div>
                                <div className={`${styles.timelineStep} ${trackingStage >= 1 ? styles.stepDone : ''}`}>
                                  <div className={styles.stepMarker}>2</div>
                                  <div className={styles.stepLabel}>Processing</div>
                                </div>
                                <div className={`${styles.timelineConnector} ${trackingStage >= 2 ? styles.connectorDone : ''}`}></div>
                                <div className={`${styles.timelineStep} ${trackingStage >= 2 ? styles.stepDone : ''}`}>
                                  <div className={styles.stepMarker}>3</div>
                                  <div className={styles.stepLabel}>Shipped</div>
                                </div>
                                <div className={`${styles.timelineConnector} ${trackingStage >= 3 ? styles.connectorDone : ''}`}></div>
                                <div className={`${styles.timelineStep} ${trackingStage >= 3 ? styles.stepDone : ''}`}>
                                  <div className={styles.stepMarker}>4</div>
                                  <div className={styles.stepLabel}>Delivered</div>
                                </div>
                              </div>
                            </div>

                            {/* Line Items */}
                            <div className={styles.orderItems}>
                              <h4 className="serif" style={{ marginBottom: '12px' }}>Items</h4>
                              {items.map(({ node }, index) => {
                                const price = node.variant?.price?.amount || 0;
                                const currency = node.variant?.price?.currencyCode || 'USD';
                                const thumbnail = node.variant?.image?.url;
                                return (
                                  <div key={index} className={styles.itemRow}>
                                    <div className={styles.itemImageWrapper}>
                                      {thumbnail ? (
                                        <Image
                                          src={thumbnail}
                                          alt={node.variant?.image?.altText || node.title}
                                          fill
                                          sizes="60px"
                                          className={styles.itemImage}
                                        />
                                      ) : (
                                        <div className={styles.itemImagePlaceholder}></div>
                                      )}
                                    </div>
                                    <div className={styles.itemInfo}>
                                      <span className={styles.itemTitle}>{node.title}</span>
                                      <span className={styles.itemVariant}>Size: {node.variant?.title || 'One Size'}</span>
                                      <span className={styles.itemQuantity}>Qty: {node.quantity}</span>
                                    </div>
                                    <div className={styles.itemTotal}>
                                      {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: currency
                                      }).format(price * node.quantity)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADDRESSES MANAGER */}
          {activeTab === 'addresses' && (
            <div className={styles.tabPane}>
              <div className={styles.paneHeader}>
                <h2 className="serif">Saved Addresses</h2>
                {!isEditingAddress && (
                  <button className="btn-primary" style={{ padding: '10px 20px', borderRadius: '8px' }} onClick={() => setIsEditingAddress(true)}>
                    Add Address
                  </button>
                )}
              </div>

              {/* Address Form (Add/Edit) */}
              {isEditingAddress && (
                <div className={`glass-bento ${styles.addressFormCard}`}>
                  <h3 className="serif" style={{ marginBottom: '20px' }}>
                    {addressFormId ? 'Edit Address' : 'New Address'}
                  </h3>

                  {addressError && <div className={styles.errorMessage}>{addressError}</div>}

                  <form onSubmit={handleAddressSubmit}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="addr-first-name">First Name</label>
                        <input
                          type="text"
                          id="addr-first-name"
                          value={addressFormFirstName}
                          onChange={(e) => setAddressFormFirstName(e.target.value)}
                          required
                          placeholder="First Name"
                          autoComplete="given-name"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="addr-last-name">Last Name</label>
                        <input
                          type="text"
                          id="addr-last-name"
                          value={addressFormLastName}
                          onChange={(e) => setAddressFormLastName(e.target.value)}
                          required
                          placeholder="Last Name"
                          autoComplete="family-name"
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="addr-phone">Phone Number</label>
                        <input
                          type="tel"
                          id="addr-phone"
                          value={addressFormPhone}
                          onChange={(e) => setAddressFormPhone(e.target.value)}
                          required
                          placeholder="Phone Number"
                          autoComplete="tel"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="addr-country">Country</label>
                        <input
                          type="text"
                          id="addr-country"
                          value={addressFormCountry}
                          onChange={(e) => setAddressFormCountry(e.target.value)}
                          required
                          placeholder="Country"
                          autoComplete="country-name"
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="addr-street1">Street Address</label>
                      <input
                        type="text"
                        id="addr-street1"
                        value={addressFormStreet1}
                        onChange={(e) => setAddressFormStreet1(e.target.value)}
                        required
                        placeholder="Street address, P.O. box, company name"
                        autoComplete="address-line1"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="addr-street2">Apartment, suite, unit, building, floor, etc. (optional)</label>
                      <input
                        type="text"
                        id="addr-street2"
                        value={addressFormStreet2}
                        onChange={(e) => setAddressFormStreet2(e.target.value)}
                        placeholder="Apartment, suite, etc."
                        autoComplete="address-line2"
                      />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="addr-city">City</label>
                        <input
                          type="text"
                          id="addr-city"
                          value={addressFormCity}
                          onChange={(e) => setAddressFormCity(e.target.value)}
                          required
                          placeholder="City"
                          autoComplete="address-level2"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="addr-province">State / Province</label>
                        <input
                          type="text"
                          id="addr-province"
                          value={addressFormProvince}
                          onChange={(e) => setAddressFormProvince(e.target.value)}
                          required
                          placeholder="State / Province"
                          autoComplete="address-level1"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="addr-zip">Postal / ZIP Code (optional)</label>
                        <input
                          type="text"
                          id="addr-zip"
                          value={addressFormZip}
                          onChange={(e) => setAddressFormZip(e.target.value)}
                          placeholder="Postal code"
                          autoComplete="postal-code"
                        />
                      </div>
                    </div>

                    <div className={styles.formActions}>
                      <button type="submit" className="btn-primary" disabled={addressSubmitting}>
                        {addressSubmitting ? 'Saving...' : 'Save Address'}
                      </button>
                      <button type="button" className="btn-outline" onClick={resetAddressForm}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Addresses List */}
              <div className={styles.addressesGrid}>
                {addresses.map((addr, index) => {
                  const isDefault = user.defaultAddress?.id === addr.id || index === 0;
                  return (
                    <div key={addr.id} className={`glass-bento ${styles.addressCard} ${isDefault ? styles.defaultAddressCard : ''}`}>
                      <div className={styles.addressHeader}>
                        <span className={styles.addressName}>{addr.firstName} {addr.lastName}</span>
                        {isDefault && <span className={styles.defaultLabel}>Default</span>}
                      </div>

                      <div className={styles.addressDetails}>
                        <p>{addr.address1}</p>
                        {addr.address2 && <p>{addr.address2}</p>}
                        <p>{addr.city}, {addr.province} {addr.zip}</p>
                        <p>{addr.country}</p>
                        <p className={styles.addressPhone}>Phone: {addr.phone}</p>
                      </div>

                      <div className={styles.addressActions}>
                        <button className={styles.addressActionBtn} onClick={() => startEditAddress(addr)}>
                          Edit
                        </button>
                        {!isDefault && (
                          <button className={styles.addressActionBtn} onClick={() => setDefaultAddress(addr.id)}>
                            Set Default
                          </button>
                        )}
                        <button className={`${styles.addressActionBtn} ${styles.deleteActionBtn}`} onClick={() => deleteAddress(addr.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: MOCK PAYMENT CARDS WALLET */}
          {activeTab === 'cards' && (
            <div className={styles.tabPane}>
              <div className={styles.paneHeader}>
                <h2 className="serif">Saved Payment Cards</h2>
                {!isAddingCard && (
                  <button className="btn-primary" style={{ padding: '10px 20px', borderRadius: '8px' }} onClick={() => setIsAddingCard(true)}>
                    Add Card
                  </button>
                )}
              </div>

              {/* Add Card Form */}
              {isAddingCard && (
                <div className={`glass-bento ${styles.cardFormCard}`}>
                  <h3 className="serif" style={{ marginBottom: '20px' }}>Add Saved Card</h3>

                  {cardError && <div className={styles.errorMessage}>{cardError}</div>}

                  <form onSubmit={handleCardSubmit}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="card-number">Card Number</label>
                        <input
                          type="text"
                          id="card-number"
                          value={cardFormNumber}
                          onChange={(e) => formatCardNumberInput(e.target.value)}
                          placeholder="4111 2222 3333 4444"
                          required
                          maxLength="19"
                          autoComplete="cc-number"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="card-holder">Cardholder Name</label>
                        <input
                          type="text"
                          id="card-holder"
                          value={cardFormHolder}
                          onChange={(e) => setCardFormHolder(e.target.value)}
                          placeholder="Aarav Sharma"
                          required
                          maxLength="50"
                          autoComplete="cc-name"
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="card-expiry">Expiry Date</label>
                        <input
                          type="text"
                          id="card-expiry"
                          value={cardFormExpiry}
                          onChange={(e) => formatExpiryInput(e.target.value)}
                          placeholder="MM/YY"
                          required
                          maxLength="5"
                          autoComplete="cc-exp"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="card-cvv">CVV</label>
                        <input
                          type="password"
                          id="card-cvv"
                          value={cardFormCvv}
                          onChange={(e) => setCardFormCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                          placeholder="•••"
                          required
                          maxLength="4"
                          autoComplete="cc-csc"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="card-theme">Card Colorway</label>
                        <select
                          id="card-theme"
                          value={cardFormTheme}
                          onChange={(e) => setCardFormTheme(e.target.value)}
                          className={styles.cardThemeSelector}
                        >
                          <option value="gold">Gold Zari</option>
                          <option value="black">Deep Velvet Black</option>
                          <option value="emerald">Emerald Elegance</option>
                          <option value="indigo">Indigo Royal</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formActions}>
                      <button type="submit" className="btn-primary">
                        Save Card
                      </button>
                      <button type="button" className="btn-outline" onClick={() => setIsAddingCard(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Cards wallet representation */}
              <div className={styles.cardsWallet}>
                {cards.map((card) => (
                  <div key={card.id} className={`${styles.paymentCard} ${styles[`theme-${card.theme || 'gold'}`]}`}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardBrand}>{card.brand?.toUpperCase() || 'VISA'}</span>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>
                    </div>

                    <div className={styles.cardNumber}>
                      {card.number}
                    </div>

                    <div className={styles.cardFooter}>
                      <div className={styles.cardHolderWrapper}>
                        <span className={styles.cardLabel}>Card Holder</span>
                        <span className={styles.cardHolderName}>{card.holderName}</span>
                      </div>
                      <div className={styles.cardExpiryWrapper}>
                        <span className={styles.cardLabel}>Expires</span>
                        <span className={styles.cardExpiryDate}>{card.expiry}</span>
                      </div>
                    </div>

                    {/* Delete action overlay */}
                    <button className={styles.deleteCardBtn} onClick={() => deleteCard(card.id)} aria-label="Remove Card">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ProfileDetailsForm({ user, updateProfile, styles }) {
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setSubmitting(true);

    try {
      const updateData = {
        firstName,
        lastName,
        email,
        phone
      };
      if (password) {
        if (password.length < 8) {
          throw new Error('New password must be at least 8 characters long.');
        }
        updateData.password = password;
      }
      const result = await updateProfile(updateData);
      if (result.success) {
        setSuccess('Profile details updated successfully.');
        setPassword('');
      } else {
        throw new Error(result.errors?.[0]?.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`glass-bento ${styles.detailsCard}`}>
      <h2 className="serif" style={{ marginBottom: '24px' }}>Profile Details</h2>

      {success && <div className={styles.successMessage}>{success}</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="profile-first-name">First Name</label>
            <input
              type="text"
              id="profile-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="First Name"
              autoComplete="given-name"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="profile-last-name">Last Name</label>
            <input
              type="text"
              id="profile-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Last Name"
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="profile-email">Email Address</label>
            <input
              type="email"
              id="profile-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email Address"
              autoComplete="email"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="profile-phone">Phone Number</label>
            <input
              type="tel"
              id="profile-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number (optional)"
              autoComplete="tel"
            />
          </div>
        </div>

        <div className={styles.formGroup} style={{ maxWidth: '50%' }}>
          <label htmlFor="profile-password">Change Password (Leave blank to keep current)</label>
          <input
            type="password"
            id="profile-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '16px' }} disabled={submitting}>
          {submitting ? 'Saving Changes...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse Google JWT:', error);
    return null;
  }
}
