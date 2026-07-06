'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { exchangeCodeForTokens, loginWithShopifyOAuth } from '@/lib/shopify/customer-account-oauth';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { restoreSession } = useAuth();

  const [status, setStatus] = useState('processing'); // processing, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function processOAuthCallback() {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam) {
        setStatus('error');
        setErrorMessage(errorDescription || `Shopify Auth Error: ${errorParam}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code found in URL parameters.');
        return;
      }

      try {
        // Step 2c: Exchange code for tokens
        const result = await exchangeCodeForTokens(code, state);

        if (result.success) {
          setStatus('success');
          // Re-initialize auth session in context so user profile is loaded immediately
          if (restoreSession) {
            await restoreSession();
          }
          // Redirect to profile or checkout
          setTimeout(() => {
            const redirectTarget = sessionStorage.getItem('oauth_return_url') || '/profile';
            sessionStorage.removeItem('oauth_return_url');
            router.push(redirectTarget);
          }, 1200);
        } else {
          setStatus('error');
          setErrorMessage(result.error || 'Failed to exchange authorization code for access tokens.');
        }
      } catch (err) {
        console.error('Unexpected error in OAuth callback:', err);
        setStatus('error');
        setErrorMessage('An unexpected error occurred during authentication.');
      }
    }

    processOAuthCallback();
  }, [searchParams, router, restoreSession]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === 'processing' && (
          <>
            <div className={styles.spinner}></div>
            <h1 className={`${styles.title} serif`}>Authenticating...</h1>
            <p className={styles.subtitle}>
              Verifying your secure credentials with Shopify Customer Accounts. Please wait a moment.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className={styles.successIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h1 className={`${styles.title} serif`}>Welcome Back</h1>
            <p className={styles.subtitle}>
              You have successfully signed in! Redirecting you to your personal sanctuary...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className={styles.errorIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h1 className={`${styles.title} serif`}>Authentication Failed</h1>
            <p className={styles.subtitle}>
              {errorMessage}
            </p>
            <div className={styles.actions}>
              <button
                className={styles.retryBtn}
                onClick={() => loginWithShopifyOAuth()}
              >
                Try Signing In Again
              </button>
              <Link href="/profile" className={styles.homeLink}>
                Return to Account Page
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AccountCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.spinner}></div>
            <h1 className={`${styles.title} serif`}>Loading Security Gateway...</h1>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
