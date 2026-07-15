'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  getUserPhotos,
  saveUserPhoto,
  setDefaultPhoto,
  deleteUserPhoto,
  saveTryonLook,
  syncGuestToUserProfile,
  checkUserConsent,
  saveUserConsent
} from '@/lib/tryon/gallery-service';
import styles from './TryOnModal.module.css';
import Link from 'next/link';
import { getShopName } from '@/lib/shopify/client';

const LOADING_MESSAGES = [
  "Analyzing fabric embroidery & silk weave...",
  "Mapping body contours & natural proportions...",
  "Draping attire with royal precision...",
  "Applying luxury studio lighting & color harmonization..."
];

export default function TryOnModal({ isOpen, onClose, product, initialVariant }) {
  const { user, login, register } = useAuth();
  const { addToCart } = useCart();
  const fileInputRef = useRef(null);
  const router = useRouter();

  const checkAuthOrRedirect = () => {
    if (!user || user.id === 'guest') {
      let currentUrl = '/collections/all';
      if (typeof window !== 'undefined') {
        if (product && product.handle) {
          currentUrl = `/products/${product.handle}?tryon=true`;
        } else {
          const url = new URL(window.location.href);
          url.searchParams.set('tryon', 'true');
          currentUrl = url.pathname + url.search;
        }
        sessionStorage.setItem('oauth_return_url', currentUrl);
      }
      router.push(`/profile?redirect=${encodeURIComponent(currentUrl)}`);
      return false;
    }
    return true;
  };

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Photo, 2: AI Loading, 3: Result

  useEffect(() => {
    setMounted(true);
  }, []);
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [replaceId, setReplaceId] = useState(null); // If user wants to replace a specific photo
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [tryonResult, setTryonResult] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const [shopName, setShopName] = useState('');
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  useEffect(() => {
    getShopName().then(name => setShopName(name));
  }, []);

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

  // Cycling loading messages during step 2
  useEffect(() => {
    if (step !== 2) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [step]);

  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  // Handle File Upload
  const handleFileUpload = async (e) => {
    if (!checkAuthOrRedirect()) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Please upload an image file (JPEG, PNG, WEBP).' });
      return;
    }

    // Check if user has already consented
    const alreadyConsented = await checkUserConsent(user?.id);
    if (alreadyConsented) {
      proceedWithUpload(file);
    } else {
      setPendingFile(file);
      setShowConsentModal(true);
    }
  };

  const handleConsentConfirm = async () => {
    setShowConsentModal(false);
    if (pendingFile) {
      await saveUserConsent(user?.id);
      proceedWithUpload(pendingFile);
      setPendingFile(null);
    }
  };

  const handleConsentCancel = () => {
    setShowConsentModal(false);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const proceedWithUpload = async (file) => {
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
    if (!checkAuthOrRedirect()) return;
    setReplaceId(photoId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Generate Try On Look
  const handleGenerate = async () => {
    if (isGenerating) return; // Prevent overlapping clicks from slow cellular connections
    if (!checkAuthOrRedirect()) return;
    if (!selectedPhoto) {
      setFeedback({ type: 'error', message: 'Please select or upload a reference photo first.' });
      return;
    }

    setIsGenerating(true);
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
          price: price,
          userId: user?.id || 'guest'
        })
      });

      const data = await res.json();
      if (data.success && data.result) {
        setTryonResult(data.result);
        setStep(3);

        // Auto-save to profile gallery
        try {
          await saveTryonLook(user?.id, {
            tryonImageUrl: data.result.tryonImageUrl,
            photoUsedUrl: data.result.photoUsedUrl,
            product: {
              handle: product?.handle || '',
              title: title,
              price: price,
              currencyCode: currency,
              image: primaryImage,
              selectedColor: selectedColor,
              variantId: activeVariantId
            },
            stylistNotes: data.result.stylistNotes
          });
        } catch (saveErr) {
          console.warn('Auto-save to gallery failed:', saveErr);
        }
      } else {
        throw new Error(data.error || 'Failed to generate try-on look.');
      }
    } catch (err) {
      console.error('Try on error:', err);
      setFeedback({ type: 'error', message: err.message || 'Something went wrong. Please try again.' });
      setStep(1);
    } finally {
      setIsGenerating(false);
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
      setFeedback({ type: 'success', message: 'Saved to your Profile Gallery' });
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
      setFeedback({ type: 'success', message: 'Added to bag successfully' });
    } else {
      setFeedback({ type: 'error', message: res.error || 'Could not add to cart.' });
    }
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <span className={styles.geminiBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" />
              </svg>
              {shopName ? `${shopName} AI Studio` : 'AI Studio'}
            </span>
            <div>
              <h3 className={`${styles.title} serif`}>Virtual Try-On Suite</h3>
              <p className={styles.subtitle}>Powered by Google Gemini Multimodal Vision</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
                  <div
                    className={styles.productMiniImg}
                    onClick={() => { setZoomedImage({ url: primaryImage, title: title }); setZoomLevel(1); }}
                    style={{ cursor: 'zoom-in' }}
                    title="Click to zoom image"
                  >
                    <Image src={primaryImage} alt={title} fill sizes="56px" style={{ objectFit: 'contain', padding: '4px' }} />
                  </div>
                )}
                <div className={styles.productMiniInfo}>
                  <h4 className="serif">{title}</h4>
                  <p className="sans">
                    {price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(price) : 'Luxury Tier'} • {selectedColor}
                  </p>
                </div>
              </div>

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
                            {(p.url || p.dataUrl) && typeof (p.url || p.dataUrl) === 'string' && (p.url || p.dataUrl).trim() !== "" ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={p.url || p.dataUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />
                            ) : null}
                            <div className={styles.photoActions}>
                              <button
                                type="button"
                                className={styles.actionIconBtn}
                                onClick={(e) => handleSetDefault(e, p.id)}
                                title="Set as Default"
                                style={{ background: p.isDefault ? '#d4af37' : 'rgba(0,0,0,0.7)', color: p.isDefault ? '#000' : '#fff' }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill={p.isDefault ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                              </button>
                              <button
                                type="button"
                                className={styles.actionIconBtn}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setZoomedImage({ url: p.url || p.dataUrl, title: p.name });
                                  setZoomLevel(1);
                                }}
                                title="Zoom & Inspect Photo"
                                style={{ background: 'rgba(212, 175, 55, 0.8)', color: '#000' }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                              </button>
                              <button
                                type="button"
                                className={styles.actionIconBtn}
                                onClick={(e) => handleReplaceClick(e, p.id)}
                                title="Replace this photo"
                                style={{ background: 'rgba(30,58,138,0.8)' }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                              </button>
                              <button
                                type="button"
                                className={styles.actionIconBtn}
                                onClick={(e) => handleDeletePhoto(e, p.id)}
                                title="Delete photo"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
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
                          if (!checkAuthOrRedirect()) return;
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
                disabled={!selectedPhoto || uploading || isGenerating}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  {isGenerating ? 'Generating your look... (takes ~5-10s)' : 'Generate Virtual Try-On Look'}
                </span>
              </button>
            </div>
          )}

          {/* Step 2: AI Loading Studio */}
          {step === 2 && (
            <div className={styles.loadingContainer}>
              <div className={styles.shimmerCircle}></div>
              <h4 className={`${styles.loadingTitle} serif`}>{shopName ? `${shopName} AI Studio is Draping Your Look` : 'AI Studio is Draping Your Look'}</h4>
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
                    <div
                      className={styles.comparisonBox}
                      onClick={() => { setZoomedImage({ url: tryonResult.photoUsedUrl, title: 'Your Reference' }); setZoomLevel(1); }}
                      style={{ cursor: 'zoom-in' }}
                      title="Click to zoom in"
                    >
                      {tryonResult.photoUsedUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={tryonResult.photoUsedUrl} alt="Your Reference" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />
                      )}
                      <span className={styles.comparisonLabel}>Your Reference</span>
                      <div className={styles.zoomHint}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                        <span>Click to Zoom</span>
                      </div>
                    </div>
                    <div
                      className={styles.comparisonBox}
                      onClick={() => { setZoomedImage({ url: tryonResult.tryonImageUrl, title: 'AI Draped Look' }); setZoomLevel(1); }}
                      style={{ cursor: 'zoom-in' }}
                      title="Click to zoom in"
                    >
                      {tryonResult.tryonImageUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={tryonResult.tryonImageUrl} alt="AI Try-On Result" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />
                      )}
                      <span className={styles.comparisonLabel}>AI Draped Look</span>
                      <div className={styles.zoomHint}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                        <span>Click to Zoom</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.secondaryActions}>
                    <button type="button" className={styles.secondaryBtn} onClick={() => setStep(1)}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                        Try Another Photo
                      </span>
                    </button>
                  </div>
                </div>

                {/* Stylist Consultation Column */}
                <div className={styles.stylistCol}>
                  <div className={styles.stylistCard}>
                    <div className={styles.stylistHeader}>
                      <span className={styles.stylistIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15 10 23 12 15 14 12 22 9 14 1 12 9 10 12 2"></polygon></svg>
                      </span>
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
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                        Add This Look To Bag
                      </span>
                    </button>

                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Zoom Overlay */}
      {zoomedImage && (
        <div className={styles.zoomOverlay} onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}>
          <div className={styles.zoomHeader} onClick={(e) => e.stopPropagation()}>
            <span className={styles.zoomTitle}>{zoomedImage.title || 'Image Preview'}</span>
            <div className={styles.zoomControls}>
              <button
                type="button"
                className={styles.zoomBtn}
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 0.5))}
                disabled={zoomLevel <= 0.5}
                title="Zoom Out"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              </button>
              <span className={styles.zoomLevelText}>{Math.round(zoomLevel * 100)}%</span>
              <button
                type="button"
                className={styles.zoomBtn}
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}
                disabled={zoomLevel >= 3}
                title="Zoom In"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              </button>
              <button
                type="button"
                className={styles.zoomBtn}
                onClick={() => setZoomLevel(1)}
                title="Reset Zoom"
                style={{ fontSize: '0.8rem', width: 'auto', padding: '0 12px', borderRadius: '100px' }}
              >
                Reset
              </button>
              <button
                type="button"
                className={styles.zoomCloseBtn}
                onClick={() => setZoomedImage(null)}
                title="Close Zoom"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
          
          <div
            className={styles.zoomContent}
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel(prev => prev === 1 ? 2 : 1);
            }}
          >
            <div
              className={styles.zoomImageContainer}
              style={{
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: zoomLevel === 1 ? 'zoom-in' : 'zoom-out'
              }}
            >
              <img
                src={zoomedImage.url}
                alt={zoomedImage.title || 'Zoomed Image'}
                className={styles.zoomedImg}
              />
            </div>
          </div>
        </div>
      )}

      {showConsentModal && (
        <div className={styles.consentOverlay}>
          <div className={`glass-bento ${styles.consentCard}`}>
            <h3 className="serif">Data Consent Required</h3>
            <p className={styles.consentText}>
              By clicking &apos;Upload&apos;, you consent to <strong>{shopName}</strong> storing this photo in our secure database (Supabase) to enable your try-on history. Your data is encrypted and never shared. You can delete your photos at any time in your Account Dashboard. <Link href="/privacy-policy" target="_blank" className={styles.consentLink}>View Privacy Policy</Link>
            </p>
            <div className={styles.consentActions}>
              <button type="button" className="btn-outline" onClick={handleConsentCancel} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={handleConsentConfirm} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
