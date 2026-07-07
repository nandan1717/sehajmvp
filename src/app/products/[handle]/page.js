import { shopifyFetch } from '@/lib/shopify/client';
import { getProductQuery } from '@/lib/shopify/queries';
import ProductClient from '@/components/Product/ProductClient';

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const { body } = await shopifyFetch({ query: getProductQuery, variables: { handle } });
  const product = body?.data?.product;

  if (!product) {
    return { title: 'Product Not Found | Rivaaz' };
  }

  return {
    title: `${product.title} | Rivaaz`,
    description: product.description,
  };
}

export default async function ProductPage({ params }) {
  const { handle } = await params;
  const { body } = await shopifyFetch({ query: getProductQuery, variables: { handle } });
  const product = body?.data?.product;

  if (!product) {
    return (
      <div className="container" style={{ padding: '160px 24px', textAlign: 'center' }}>
        Product not found
      </div>
    );
  }

  return <ProductClient product={product} />;
}

