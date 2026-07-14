import { getShopName } from '@/lib/shopify/client';
import styles from './page.module.css';

export async function generateMetadata() {
  const shopName = await getShopName();
  return {
    title: `Privacy Policy | ${shopName}`,
    description: `Privacy Policy for ${shopName}`,
  };
}

export default async function PrivacyPolicyPage() {
  const shopName = await getShopName();

  return (
    <div className={`container ${styles.pageContainer}`}>
      <div className={`glass-bento ${styles.contentCard}`}>
        <h1 className={`${styles.title} serif`}>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Effective Date: July 13, 2026</p>
        <p className={styles.applicability}>
          Regulatory Frameworks: PIPEDA (Canada), DPDP Act, 2023 (India), IT Act SPDI Rules (India), CASL (Canada).
        </p>
        
        <div className={styles.richText}>
          <h2>1. Identity of Data Fiduciary & Accountability</h2>
          <p>
            Under India's DPDP Act, 2023, we act as the "Data Fiduciary", and you are the "Data Principal." Under Canada's PIPEDA, we are the accountable organization responsible for your personal information.
          </p>
          <ul>
            <li><strong>Legal Entity Name:</strong> {shopName}</li>
            <li><strong>Data Protection / Grievance Officer:</strong> Nandan Goyal</li>
            <li><strong>Contact Email:</strong> privacy@rivaaz.co</li>
            <li><strong>Physical Mailing Address:</strong> Toronto, Canada / New Delhi, India</li>
          </ul>

          <h2>2. Itemized Data Mapping: What We Collect & Why</h2>
          <p>
            We practice data minimization and only collect digital personal data strictly necessary to fulfill e-commerce transactions, authenticate users, and provide AI-assisted customer support.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Data Category</th>
                  <th>Specific Data Items Collected</th>
                  <th>Collection Source</th>
                  <th>Lawful Purpose & Legal Basis</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Authentication & Identity Data</strong></td>
                  <td>Full Name, Email Address, Google Profile Photo URL, Unique Google OAuth User ID.</td>
                  <td>Google SSO (Upon Log-In / Sign-Up)</td>
                  <td>Consent & Contract Fulfillment: To establish your user dashboard, authenticate order tracking access, and prevent identity spoofing.</td>
                </tr>
                <tr>
                  <td><strong>E-Commerce & Transaction Data</strong></td>
                  <td>Billing Address, Shipping Address, Phone Number, Order History, IP Address, Device metadata.</td>
                  <td>Shopify Backend</td>
                  <td>Contract Fulfillment & Legal Compliance: To process payments, ship military/tactical gear, calculate regional taxes, and prevent fraud.</td>
                </tr>
                <tr>
                  <td><strong>Payment Metadata</strong></td>
                  <td>Last 4 digits of card, transaction ID, payment status (We do not store full credit card or UPI numbers).</td>
                  <td>Payment Gateways via Shopify</td>
                  <td>Contract Fulfillment: Secure payment routing and auditing.</td>
                </tr>
                <tr>
                  <td><strong>AI Interaction Logs</strong></td>
                  <td>Text queries, order tracking prompts, chat transcripts, and customer support inquiries.</td>
                  <td>Revisal Tyrons / Google Gemini API</td>
                  <td>Consent & Service Improvement: To provide real-time order status, technical product assistance, and customer support.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>3. Purpose Limitation & Algorithmic Transparency</h2>
          <p>
            We collect and process your data exclusively for the purposes stated above.
          </p>
          <p>
            <strong>How Gemini AI Uses Your Data:</strong> When you ask our chat assistant to track an order or recommend tactical gear, our system (Revisal Tyrons) securely passes your text prompt and relevant Shopify order status to the Google Gemini API.
          </p>
          <p>
            <strong>Zero-Retention for AI Training:</strong> We have configured our enterprise API connectors such that your personal data, chat logs, and order details are never used by Google or Revisal Tyrons to train public foundational AI models.
          </p>
          <p>
            <strong>Algorithmic Decisions (Canada CPPA / Law 25 Compliance):</strong> If an automated system (such as Shopify's fraud detection algorithm) flags or cancels your order without human intervention, you have the right to request an explanation of the underlying logic and request manual human review.
          </p>

          <h2>4. Third-Party Sharing & Cross-Border Data Transfers</h2>
          <p>
            To operate our storefront globally, your digital personal data is transferred to and processed by vetted third-party Data Processors:
          </p>
          <ul>
            <li><strong>Shopify Inc. (Canada/USA):</strong> Hosts our database, storefront infrastructure, and order processing logs.</li>
            <li><strong>Google LLC (USA/Global):</strong> Manages OAuth SSO authentication and powers the Gemini large language model API.</li>
            <li><strong>Revisal Tyrons:</strong> Acts as the middleware processing software connecting our Shopify storefront to Gemini AI.</li>
            <li><strong>Logistics & Shipping Partners:</strong> Regional couriers (e.g., Canada Post, Purolator, Blue Dart, Delhivery, FedEx) receive your name, address, and phone number solely to deliver physical packages.</li>
          </ul>
          <p>
            <strong>Cross-Border Sovereignty Notice:</strong> Your personal data may be stored or processed on servers located outside your country of residence (e.g., in Canada, the United States, or India). We ensure all cross-border transfers are governed by standard contractual clauses and robust data encryption that offer comparable protection to PIPEDA and the DPDP Act.
          </p>

          <h2>5. Your Statutory Rights (Canada & India)</h2>
          <p>
            Depending on your residency, you possess explicit legal rights regarding your personal data under the DPDP Act, 2023 (India) and PIPEDA / Provincial Laws (Canada):
          </p>
          <ul>
            <li><strong>Right to Access & Information:</strong> You may request an itemized summary of all personal data we hold about you, including the identities of third-party processors with whom it has been shared.</li>
            <li><strong>Right to Correction & Inaccuracy Resolution:</strong> You can edit your shipping and contact profile directly within your Google-authenticated Shopify dashboard or request manual corrections from our support team.</li>
            <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> You have the right to demand the permanent deletion of your customer account and associated personal data. Note: We must retain certain statutory transaction records (e.g., tax invoices, export compliance logs) for up to 7 years to comply with Canadian Revenue Agency (CRA) and Indian GST/Income Tax laws.</li>
            <li><strong>Right to Withdraw Consent:</strong> You may withdraw your consent for data processing at any time by disconnecting our app from your Google Account security permissions or clicking "Delete Account" in your store dashboard. Withdrawing consent will terminate your ability to track orders through the automated dashboard.</li>
            <li><strong>Right to Nominate (India DPDP Act):</strong> Indian Data Principals have the legal right to nominate another individual to exercise their data rights in the event of death or incapacity.</li>
          </ul>

          <h2>6. Protection of Minors & Verifiable Consent</h2>
          <p>
            Our storefront does not intentionally market to or solicit data from individuals under 18 years of age.
          </p>
          <p>
            In strict compliance with Section 9 of the India DPDP Act, 2023, we do not undertake behavioral monitoring, targeted advertising, or data processing likely to cause harm to a child. If we discover that an account has been created by a minor without verifiable parental/legal guardian consent, the account and all associated personal data will be purged immediately.
          </p>

          <h2>7. Canada's Anti-Spam Legislation (CASL) Compliance</h2>
          <p>
            We do not send promotional marketing emails, SMS tactical gear drops, or newsletters without your explicit, affirmative opt-in consent (e.g., checking an unchecked consent box at checkout).
          </p>
          <p>
            <strong>Transactional Exemptions:</strong> Using Google SSO to place an order establishes an "Ongoing Business Relationship." We may lawfully send you essential transactional emails (order confirmations, shipping tracking numbers, or data breach alerts) without a marketing opt-in.
          </p>
          <p>
            You may unsubscribe from marketing communications at any time by clicking the instant "Unsubscribe" link at the bottom of our emails.
          </p>

          <h2>8. Security Safeguards & Mandatory Breach Notification</h2>
          <p>
            <strong>Technical Safeguards:</strong> We employ enterprise-grade SSL/TLS encryption, OAuth 2.0 tokenization (preventing us from ever seeing your Google password), and role-based access controls within Shopify to secure your digital personal data.
          </p>
          <p>
            <strong>Breach Reporting Protocols:</strong> In the event of an accidental or unauthorized security breach that compromises the confidentiality, integrity, or availability of your data:
          </p>
          <ul>
            <li><strong>In Canada:</strong> If the breach creates a "real risk of significant harm" (RROSH), we are legally bound to notify you and the Office of the Privacy Commissioner of Canada (OPC) as soon as feasible.</li>
            <li><strong>In India:</strong> In compliance with the DPDP Act and CERT-In guidelines, we will notify the Data Protection Board of India and affected Data Principals promptly, providing details of the breach and actionable mitigation steps.</li>
          </ul>

          <h2>9. Grievance Redressal Mechanism</h2>
          <p>
            If you have concerns regarding our data practices, AI interactions, or wish to exercise your legal rights, you must first direct your query to our designated Grievance Officer / Data Protection Officer:
          </p>
          <ul>
            <li><strong>Grievance Officer:</strong> Nandan Goyal</li>
            <li><strong>Email:</strong> grievance@rivaaz.co</li>
            <li><strong>Response Timeline:</strong> We acknowledge all complaints within 48 hours and aim to resolve all statutory privacy grievances within 30 calendar days.</li>
          </ul>
          <p>
            <strong>Escalation Right:</strong>
          </p>
          <ul>
            <li><strong>India Residents:</strong> If your grievance remains unresolved after our internal review, you have the statutory right to file a formal complaint with the Data Protection Board of India under Section 18 of the DPDP Act.</li>
            <li><strong>Canadian Residents:</strong> If you are unsatisfied with our response, you may file a complaint with the Office of the Privacy Commissioner of Canada (OPC) or your provincial privacy regulator.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
