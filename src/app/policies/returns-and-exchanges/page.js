import { getShopName } from '@/lib/shopify/client';
import styles from '../../privacy-policy/page.module.css';

export async function generateMetadata() {
  const shopName = await getShopName();
  return {
    title: `Returns & Exchanges | ${shopName}`,
  };
}

export default async function ReturnsExchangesPage() {
  return (
    <div className={`container ${styles.pageContainer}`}>
      <div className={`glass-bento ${styles.contentCard}`}>
        <h1 className={`${styles.title} serif`}>Return &amp; Refund Policy</h1>
        
        <div className={styles.richText}>
          <h2>Returns</h2>
          <p>We have a 30-day return policy, which means you have <strong>30 days from the date you receive your item</strong> to request a return.</p>
          <p>To be eligible for a return, your item must be in the same condition in which you received it—unworn or unused, with all original tags attached, and in its original packaging. You must also provide the receipt or other proof of purchase.</p>
          <p>To start a return, please contact us at <strong><a href="mailto:clientwork036@gmail.com">clientwork036@gmail.com</a></strong>. Returns should be sent to the following address:</p>
          <p><strong>[INSERT RETURN ADDRESS]</strong></p>
          <p>If your return is approved, we will provide a return shipping label along with instructions on how and where to send your package.</p>
          <p><strong>Please do not send items back without requesting a return first, as they will not be accepted.</strong></p>
          <p>If you have any questions about returns, you can contact us at <strong><a href="mailto:clientwork036@gmail.com">clientwork036@gmail.com</a></strong>.</p>

          <hr />

          <h2>Damaged or Incorrect Items</h2>
          <p>Please inspect your order upon delivery. If your item is defective, damaged, or if you receive the wrong item, contact us immediately so we can evaluate the issue and resolve it as quickly as possible.</p>

          <hr />

          <h2>Non-Returnable Items</h2>
          <p>Certain items cannot be returned, including:</p>
          <ul>
            <li>Innerwear (such as underwear or any clothing that comes into direct contact with the skin)</li>
            <li>Custom or personalized products</li>
            <li>Sale items</li>
            <li>Gift cards</li>
          </ul>
          <p>If you have any questions about whether your item is eligible for a return, please contact us before initiating the return.</p>

          <hr />

          <h2>Exchanges</h2>
          <p>The quickest way to receive a different item is to return the original item. Once your return is accepted, you can place a new order for the desired item.</p>

          <hr />

          <h2>European Union 14-Day Cooling-Off Period</h2>
          <p>If your order is shipped to the European Union, you have the right to cancel or return your order within <strong>14 days</strong> of receiving it, for any reason and without providing a justification.</p>
          <p>To qualify, the item must be in the same condition in which it was received—unworn or unused, with tags attached, in its original packaging, and accompanied by proof of purchase.</p>

          <hr />

          <h2>Refunds</h2>
          <p>Once we receive and inspect your returned item, we will notify you whether your refund has been approved.</p>
          <p>If approved, the refund will be issued to your original payment method within <strong>10 business days</strong>. Please note that your bank or credit card provider may require additional time to process and post the refund.</p>
          <p>If more than <strong>15 business days</strong> have passed since your refund was approved and you have not received it, please contact us at <strong><a href="mailto:clientwork036@gmail.com">clientwork036@gmail.com</a></strong>.</p>
        </div>
      </div>
    </div>
  );
}
