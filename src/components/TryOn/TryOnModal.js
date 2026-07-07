'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  getUserPhotos,
  saveUserPhoto,
  setDefaultPhoto,
  deleteUserPhoto,
  saveTryonLook,
  syncGuestToUserProfile
} from '@/lib/tryon/gallery-service';
import styles from './TryOnModal.module.css';

const LOADING_MESSAGES = [
  "Analyzing fabric embroidery & silk weave...",
  "Mapping body contours & natural proportions...",
  "Draping attire with royal precision...",
  "Applying luxury studio lighting & color harmonization..."
];

export default function TryOnModal({ isOpen, onClose, product, initialVariant }) {
  const { user, loginWithGoogle } = useAuth();
  const { addToCart } = useCart();
  const fileInputRef = useRef(null);
  const googleBtnRef = useRef(null);

  const [step, setStep] = useState(1); // 1: Select Photo, 2: AI Loading, 3: Result
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [replaceId, setReplaceId] = useState(null); // If user wants to replace a specific photo
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [tryonResult, setTryonResult] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Extract product details
  const title = product?.title || 'Luxury Attire';
  const price = product?.priceRange?.minVariantPrice?.amount || product?.price || null;
  const currency = product?.priceRange?.minVariantPrice?.currencyCode || 'USD';
  const primaryImage = product?.images?.nodes?.[0]?.url || product?.images?.edges?.[0]?.node?.url || product?.featuredImage?.url || null;

  // Find color option if available
  const colorOpt = product?.options?.find(o => o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'colour');
  const selectedColor = colorOpt?.values?.[0] || 'Royal Gold';

  const activeVariantId = initialVariant?.id || product?.variants?.nodes?.[0]?.id || product?.variants?.edges?.[0]?.node?.id || null;

  // Load user photos when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setTryonResult(null);
    setFeedback(null);
    setReplaceId(null);

    async function loadPhotos() {
      setLoadingPhotos(true);
      const userPhotos = await getUserPhotos(user?.id);
      setPhotos(userPhotos);
      // Auto select default photo or first photo
      const defaultP = userPhotos.find(p => p.isDefault) || userPhotos[0] || null;
      setSelectedPhoto(defaultP);
      setLoadingPhotos(false);
    }

    loadPhotos();
  }, [isOpen, user]);

  // Google Sign In inside Modal
  useEffect(() => {
    if (!isOpen || user || step !== 1) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google) return;

    const handleGoogleResponse = async (response) => {
      try {
        const token = response.credential;
        // Simple JWT decode
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const decoded = JSON.parse(jsonPayload);

        if (decoded && decoded.email) {
          const res = await loginWithGoogle({
            firstName: decoded.given_name || 'Google',
            lastName: decoded.family_name || 'User',
            email: decoded.email,
            avatar: decoded.picture
          });
          if (res?.success && user?.id) {
            await syncGuestToUserProfile(user.id);
            const userPhotos = await getUserPhotos(user.id);
            setPhotos(userPhotos);
            if (userPhotos.length > 0 && !selectedPhoto) {
              setSelectedPhoto(userPhotos[0]);
            }
          }
        }
      } catch (err) {
        console.error('Google sign in inside TryOnModal failed:', err);
      }
    };

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse
      });
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'medium',
          shape: 'pill',
          text: 'signin_with'
        });
      }
    } catch (e) {
      console.warn('Google button render error:', e);
    }
  }, [isOpen, user, step, loginWithGoogle, selectedPhoto]);

  // Cycling loading messages during step 2
  useEffect(() => {
    if (step !== 2) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [step]);

  if (!isOpen) return null;

  // Handle File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Please upload an image file (JPEG, PNG, WEBP).' });
      return;
    }

    setUploading(true);
    setFeedback(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      try {
        const res = await saveUserPhoto(
          user?.id,
          { url: dataUrl, dataUrl, name: file.name },
          replaceId
        );
        if (res.success) {
          setPhotos(res.photos);
          setSelectedPhoto(res.addedPhoto);
          setReplaceId(null);
          setFeedback({ type: 'success', message: 'Photo saved to your profile gallery!' });
        }
      } catch (err) {
        setFeedback({ type: 'error', message: 'Failed to save photo.' });
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // Set as Default
  const handleSetDefault = async (e, photoId) => {
    e.stopPropagation();
    const res = await setDefaultPhoto(user?.id, photoId);
    if (res.success) {
      setPhotos(res.photos);
    }
  };

  // Delete Photo
  const handleDeletePhoto = async (e, photoId) => {
    e.stopPropagation();
    const res = await deleteUserPhoto(user?.id, photoId);
    if (res.success) {
      setPhotos(res.photos);
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto(res.photos[0] || null);
      }
    }
  };

  // Trigger file selector for replacing a specific photo
  const handleReplaceClick = (e, photoId) => {
    e.stopPropagation();
    setReplaceId(photoId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Generate Try On Look
  const handleGenerate = async () => {
    if (!selectedPhoto) {
      setFeedback({ type: 'error', message: 'Please select or upload a reference photo first.' });
      return;
    }

    setStep(2);
    setFeedback(null);

    try {
      const res = await fetch('/api/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPhoto: selectedPhoto.url || selectedPhoto.dataUrl,
          productTitle: title,
          productImage: primaryImage,
          color: selectedColor,
          price: price
        })
      });

      const data = await res.json();
      if (data.success && data.result) {
        setTryonResult(data.result);
        setStep(3);
      } else {
        throw new Error(data.error || 'Failed to generate try-on look.');
      }
    } catch (err) {
      console.error('Try on error:', err);
      setFeedback({ type: 'error', message: err.message || 'Something went wrong. Please try again.' });
      setStep(1);
    }
  };

  // Save to Gallery
  const handleSaveToGallery = async () => {
    if (!tryonResult) return;
    const res = await saveTryonLook(user?.id, {
      tryonImageUrl: tryonResult.tryonImageUrl,
      photoUsedUrl: tryonResult.photoUsedUrl,
      product: {
        handle: product?.handle || '',
        title: title,
        price: price,
        currencyCode: currency,
        image: primaryImage,
        selectedColor: selectedColor,
        variantId: activeVariantId
      },
      stylistNotes: tryonResult.stylistNotes
    });

    if (res.success) {
      setFeedback({ type: 'success', message: '❤️ Saved to your Profile Gallery!' });
    }
  };

  // Add to Bag
  const handleAddToBag = async () => {
    if (!activeVariantId) {
      setFeedback({ type: 'error', message: 'Product variant unavailable.' });
      return;
    }
    const res = await addToCart(activeVariantId, 1);
    if (res.success) {
      setFeedback({ type: 'success', message: '🛍️ Added to bag successfully!' });
    } else {
      setFeedback({ type: 'error', message: res.error || 'Could not add to cart.' });
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <span className={styles.geminiBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" />
              </svg>
              Rivaaz AI Studio
            </span>
            <div>
              <h3 className={`${styles.title} serif`}>Virtual Try-On Suite</h3>
              <p className={styles.subtitle}>Powered by Google Gemini Multimodal Vision</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Step 1: Select or Upload Photo */}
          {step === 1 && (
            <div className={styles.stepContainer}>
              {/* Product Summary Banner */}
              <div className={styles.productMiniCard}>
                {primaryImage && (
                  <div className={styles.productMiniImg}>
                    <Image src={primaryImage} alt={title} fill sizes="56px" style={{ objectFit: 'cover' }} />
                  </div>
                )}
                <div className={styles.productMiniInfo}>
                  <h4 className="serif">{title}</h4>
                  <p className="sans">
                    {price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(price) : 'Luxury Tier'} • {selectedColor}
                  </p>
                </div>
              </div>

              {/* Google Sign In Banner for Guests */}
              {!user && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                <div className={styles.googleBanner}>
                  <div className={styles.googleBannerText}>
                    <h5>Save Your Looks Across Devices</h5>
                    <p>Sign in with Google to sync your 2 reference photos and try-on gallery to your profile.</p>
                  </div>
                  <div ref={googleBtnRef}></div>
                </div>
              )}

              {/* Photo Selector Section */}
              <div>
                <div className={styles.sectionHeading}>
                  <span className="serif">Choose Reference Photo</span>
                  <span className={styles.photoLimitText}>
                    {photos.length} / 2 Saved Photos (No need to re-upload!)
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/webp"
                  style={{ display: 'none' }}
                />

                {loadingPhotos ? (
                  <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>Loading your saved gallery photos...</p>
                ) : (
                  <div className={styles.photoGrid}>
                    {/* Render saved photos */}
                    {photos.map((p) => {
                      const isSelected = selectedPhoto?.id === p.id;
                      return (
                        <div
                          key={p.id}
                          className={`${styles.photoCard} ${isSelected ? styles.photoCardSelected : ''}`}
                          onClick={() => setSelectedPhoto(p)}
                        >
                          <div className={styles.photoImgWrapper}>
                            <Image src={p.url || p.dataUrl} alt={p.name} fill sizes="200px" style={{ objectFit: 'cover' }} />
                            <div className={styles.photoActions}>
                              <button
                                type="button"
                                className={styles.actionIconBtn}
                                onClick={(e) => handleSetDefault(e, p.id)}
                                title="Set as Default"
                                style={{ background: p.isDefault ? '#d4af37' : 'rgba(0,0,0,0.7)', color: p.isDefault ? '#000' : '#fff' }}
                              >
                                ★
                              </button>
                              <button
                                type="button"
                                className={styles.actionIconBtn}
                                onClick={(e) => handleReplaceClick(e, p.id)}
                                title="Replace this photo"
                                style={{ background: 'rgba(30,58,138,0.8)' }}
                              >
                                🔄
                              </button>
                              <button
                                type="button"
                                className={styles.actionIconBtn}
                                onClick={(e) => handleDeletePhoto(e, p.id)}
                                title="Delete photo"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          <div className={styles.photoMeta}>
                            <span className={styles.photoName}>{p.name}</span>
                            {p.isDefault && <span className={styles.defaultBadge}>Default</span>}
                          </div>
                        </div>
                      );
                    })}

                    {/* Render Upload Card if under limit */}
                    {photos.length < 2 && (
                      <div
                        className={styles.uploadCard}
                        onClick={() => {
                          setReplaceId(null);
                          if (fileInputRef.current) fileInputRef.current.click();
                        }}
                      >
                        <div className={styles.uploadIcon}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <h5 className={styles.uploadTitle}>
                          {uploading ? 'Uploading & Saving...' : photos.length === 0 ? 'Upload Reference Photo' : 'Add 2nd Reference Photo'}
                        </h5>
                        <p className={styles.uploadSubtitle}>
                          Supports JPEG, PNG, WEBP. Saved permanently to your profile!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Feedback Message */}
              {feedback && (
                <div className={`${styles.feedbackMsg} ${feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}`}>
                  {feedback.message}
                </div>
              )}

              {/* Generate Button */}
              <button
                type="button"
                className={styles.generateBtn}
                onClick={handleGenerate}
                disabled={!selectedPhoto || uploading}
              >
                <span>✨ Generate Virtual Try-On Look</span>
              </button>
            </div>
          )}

          {/* Step 2: AI Loading Studio */}
          {step === 2 && (
            <div className={styles.loadingContainer}>
              <div className={styles.shimmerCircle}></div>
              <h4 className={`${styles.loadingTitle} serif`}>Rivaaz AI Studio is Draping Your Look</h4>
              <p className={`${styles.loadingText} sans`}>{LOADING_MESSAGES[loadingMsgIdx]}</p>
            </div>
          )}

          {/* Step 3: Try-On Result Suite */}
          {step === 3 && tryonResult && (
            <div className={styles.stepContainer}>
              <div className={styles.resultGrid}>
                {/* Image Comparison Column */}
                <div className={styles.resultImageCol}>
                  <div className={styles.comparisonWrapper}>
                    <div className={styles.comparisonBox}>
                      {tryonResult.photoUsedUrl && (
                        <Image src={tryonResult.photoUsedUrl} alt="Your Reference" fill sizes="340px" style={{ objectFit: 'cover' }} />
                      )}
                      <span className={styles.comparisonLabel}>Your Reference</span>
                    </div>
                    <div className={styles.comparisonBox}>
                      {tryonResult.tryonImageUrl && (
                        <Image src={tryonResult.tryonImageUrl} alt="AI Try-On Result" fill sizes="340px" style={{ objectFit: 'cover' }} />
                      )}
                      <span className={styles.comparisonLabel}>AI Draped Look</span>
                    </div>
                  </div>

                  <div className={styles.secondaryActions}>
                    <button type="button" className={styles.secondaryBtn} onClick={() => setStep(1)}>
                      🔄 Try Another Photo
                    </button>
                  </div>
                </div>

                {/* Stylist Consultation Column */}
                <div className={styles.stylistCol}>
                  <div className={styles.stylistCard}>
                    <div className={styles.stylistHeader}>
                      <span className={styles.stylistIcon}>✨</span>
                      <h4 className="serif">AI Master Stylist Consultation</h4>
                    </div>

                    <div className={styles.stylistSection}>
                      <h5 className="sans">Silhouette & Draping Analysis</h5>
                      <p className="serif">{tryonResult.stylistNotes}</p>
                    </div>

                    {tryonResult.fitAnalysis && (
                      <div className={styles.stylistSection}>
                        <h5 className="sans">Technical Fit & Proportion</h5>
                        <p className="serif">{tryonResult.fitAnalysis}</p>
                      </div>
                    )}

                    {tryonResult.stylingAdvice && (
                      <div className={styles.stylistSection}>
                        <h5 className="sans">Recommended Royal Pairing</h5>
                        <p className="serif">{tryonResult.stylingAdvice}</p>
                      </div>
                    )}
                  </div>

                  {/* Feedback Message */}
                  {feedback && (
                    <div className={`${styles.feedbackMsg} ${feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}`}>
                      {feedback.message}
                    </div>
                  )}

                  {/* Primary Action Row */}
                  <div className={styles.actionRow}>
                    <button type="button" className={styles.addToBagBtn} onClick={handleAddToBag}>
                      🛍️ Add This Look To Bag
                    </button>
                    <button type="button" className={styles.saveGalleryBtn} onClick={handleSaveToGallery}>
                      ❤️ Save to Profile Gallery
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
