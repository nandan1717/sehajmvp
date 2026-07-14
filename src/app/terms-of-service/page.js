import { getShopName } from '@/lib/shopify/client';
import styles from './page.module.css';

export async function generateMetadata() {
  const shopName = await getShopName();
  return {
    title: `Terms of Service | ${shopName}`,
    description: `Terms of Service for ${shopName}`,
  };
}

export default async function TermsOfServicePage() {
  const shopName = await getShopName();

  return (
    <div className={`container ${styles.pageContainer}`}>
      <div className={`glass-bento ${styles.contentCard}`}>
        <h1 className={`${styles.title} serif`}>Terms of Service</h1>
        <p className={styles.lastUpdated}>Last Updated: July 13, 2026</p>
        <p className={styles.applicability}>Applicability: Global Users (with explicit provisions for residents of Canada and the Republic of India)</p>
        
        <div className={styles.richText}>
          <h2>1. Definitions & Agreement to Terms</h2>
          <p>
            By accessing, browsing, creating an account via Google Single Sign-On (SSO), or purchasing tactical gear, apparel, or goods from <strong>{shopName}</strong> ("We," "Us," "Our," or "The Data Fiduciary"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you must cease using our storefront immediately.
          </p>
          <ul>
            <li><strong>"Storefront"</strong>: The public-facing online portal and user interface operated by us.</li>
            <li><strong>"Backend Engine"</strong>: Our e-commerce infrastructure, inventory, payment routing, and customer database hosted and managed by Shopify Inc.</li>
            <li><strong>"AI Assistant / Gemini Engine"</strong>: Automated customer service, order support, and recommendation systems powered by Google’s Gemini API integrated via the Revisal Tyrons software architecture.</li>
            <li><strong>"Google SSO"</strong>: The OAuth 2.0 authentication service provided by Google LLC used to sign up, log in, manage profiles, and track order histories.</li>
          </ul>

          <h2>2. Age & Account Eligibility</h2>
          <p>
            <strong>Age Requirement:</strong> You must be at least 18 years of age (the age of majority in your jurisdiction) to create an account or purchase items from this storefront. By using Google SSO to register, you represent and warrant that you meet this requirement.
          </p>
          <p>
            <strong>Google Authentication Accountability:</strong> You are solely responsible for securing your Google Account credentials. All actions, orders, and inquiries initiated through your authenticated Google profile are deemed legally authorized by you. We are not liable for unauthorized account access resulting from compromised Google passwords or tokens.
          </p>

          <h2>3. Tactical Goods, Export Controls, and End-Use</h2>
          <p>
            <strong>Compliance with Defense & Retail Laws:</strong> As an "Army Store," certain products sold (e.g., tactical vests, specialized optics, survival gear) may be subject to national and international trade regulations, including the Canadian Export and Import Permits Act and India's Foreign Trade (Development & Regulation) Act.
          </p>
          <p>
            <strong>Prohibited Use:</strong> You agree not to purchase, export, or re-sell any items from this storefront for illegal, unauthorized military, or terrorist activities. We reserve the right to cancel orders and report transactions to Canadian (e.g., CBSA, RCMP) or Indian (e.g., Customs, MHA) enforcement agencies if suspicious end-use is detected.
          </p>

          <h2>4. AI Services & Gemini API Usage Rules</h2>
          <p>
            Our storefront embeds artificial intelligence tools (Revisal Tyrons incorporating Google Gemini) to assist with order tracking, product specifications, and general inquiries.
          </p>
          <p>
            <strong>No Reverse Engineering or Prompt Injection:</strong> You are strictly prohibited from submitting malicious payloads, prompt-injection attacks, scraping scripts, or attempts to extract the underlying system prompts or API keys of the Revisal Tyrons / Gemini architecture.
          </p>
          <p>
            <strong>Algorithmic Transparency & Disclaimer:</strong> While the AI assistant is trained on our catalog and Shopify backend data, AI responses may occasionally exhibit inaccuracies or "hallucinations." Automated AI responses do not constitute a legally binding price quotation or warranty. Final pricing, shipping fees, and stock availability are strictly governed by the checkout screen on our Shopify backend.
          </p>

          <h2>5. Order Processing, Payments, and Cancellation</h2>
          <p>
            All transactions are processed through encrypted Shopify payment gateways (or supported third-party processors like Stripe, PayPal, or Razorpay).
          </p>
          <p>
            Under the Indian Consumer Protection (E-Commerce) Rules, 2020 and Canadian consumer protection acts, we reserve the right to refuse or cancel any order due to typographical errors in pricing, inventory stock-outs, or suspected fraudulent transactions identified by Shopify's automated fraud algorithms.
          </p>

          <h2>6. Limitation of Liability & Indemnification</h2>
          <p>
            To the fullest extent permitted by applicable Canadian and Indian laws:
          </p>
          <p>
            In no event shall <strong>{shopName}</strong>, its officers, directors, Shopify Inc., Google LLC, or Revisal Tyrons be liable for any indirect, incidental, special, punitive, or consequential damages (including lost profits or data loss) arising from your use of the storefront.
          </p>
          <p>
            Our total cumulative liability for any direct claim arising from a transaction shall not exceed the actual purchase price paid by you for the specific order giving rise to the claim.
          </p>

          <h2>7. Governing Law & Dispute Resolution</h2>
          <p>
            <strong>For Canadian Residents:</strong> These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein. Any legal proceedings shall be conducted exclusively in the courts of Toronto, Ontario.
          </p>
          <p>
            <strong>For Indian Residents:</strong> These Terms are governed by the Information Technology Act, 2000, the Contract Act, 1872, and consumer laws of the Republic of India. Disputes shall be subject to the jurisdiction of the competent courts in New Delhi, or resolved via arbitration under the Arbitration and Conciliation Act, 1996.
          </p>
        </div>
      </div>
    </div>
  );
}
