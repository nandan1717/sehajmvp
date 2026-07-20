import { cartFragment } from './fragments';

export const getProductsQuery = `
  query getProducts {
    products(first: 24, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          handle
          description
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            url
            altText
            width
            height
          }
          images(first: 1) {
            nodes {
              url
              altText
              width
              height
            }
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
          options {
            id
            name
            values
          }
          variants(first: 25) {
            nodes {
              id
              title
              availableForSale
              quantityAvailable
              image {
                url
                altText
                width
                height
              }
              selectedOptions {
                name
                value
              }
            }
            edges {
              node {
                id
                title
                availableForSale
                quantityAvailable
                image {
                  url
                  altText
                  width
                  height
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const getProductsByTagQuery = `
  query getProductsByTag($query: String!) {
    products(first: 24, query: $query, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            url
            altText
            width
            height
          }
          images(first: 1) {
            nodes {
              url
              altText
              width
              height
            }
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
          options {
            id
            name
            values
          }
          variants(first: 25) {
            nodes {
              id
              title
              availableForSale
              quantityAvailable
              image {
                url
                altText
                width
                height
              }
              selectedOptions {
                name
                value
              }
            }
            edges {
              node {
                id
                title
                availableForSale
                quantityAvailable
                image {
                  url
                  altText
                  width
                  height
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const getProductQuery = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      productType
      vendor
      tags
      publishedAt
      availableForSale
      
      seo {
        title
        description
      }
      
      featuredImage {
        url
        altText
        width
        height
      }
      
      images(first: 20) {
        nodes {
          url
          altText
          width
          height
        }
        edges {
          node {
            url
            altText
            width
            height
          }
        }
      }
      
      options {
        id
        name
        values
      }
      
      variants(first: 100) {
        nodes {
          id
          title
          availableForSale
          quantityAvailable
          sku
          barcode
          requiresShipping
          weight
          weightUnit
          
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          
          selectedOptions {
            name
            value
          }
          
          image {
            url
            altText
            width
            height
          }
        }
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            sku
            barcode
            requiresShipping
            weight
            weightUnit
            
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            
            selectedOptions {
              name
              value
            }
            
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
      
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      
      collections(first: 10) {
        nodes {
          id
          title
          handle
        }
        edges {
          node {
            id
            title
            handle
          }
        }
      }
      
      metafields(identifiers: [
        { namespace: "custom", key: "material" }
        { namespace: "custom", key: "care_instructions" }
        { namespace: "custom", key: "size_guide" }
        { namespace: "custom", key: "fabric" }
        { namespace: "custom", key: "fit" }
      ]) {
        key
        namespace
        value
        type
      }
    }
  }
`;

export const getCollectionQuery = `
  query getCollection($handle: String!) {
    collection(handle: $handle) {
      id
      title
      description
      products(first: 24, sortKey: CREATED, reverse: true) {
        edges {
          node {
            id
            title
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              url
              altText
              width
              height
            }
            images(first: 1) {
              nodes {
                url
                altText
                width
                height
              }
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }
            options {
              id
              name
              values
            }
            variants(first: 25) {
              nodes {
                id
                title
                availableForSale
                quantityAvailable
                image {
                  url
                  altText
                  width
                  height
                }
                selectedOptions {
                  name
                  value
                }
              }
              edges {
                node {
                  id
                  title
                  availableForSale
                  quantityAvailable
                  image {
                    url
                    altText
                    width
                    height
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const getCollectionsQuery = `
  query getCollections {
    collections(first: 10) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

export const getCartQuery = `
  ${cartFragment}
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }
`;

export const predictiveSearchQuery = `
  query PredictiveSearch($query: String!) @inContext(country: CA) {
    predictiveSearch(query: $query, types: [PRODUCT, COLLECTION]) {
      products {
        id
        title
        handle
        featuredImage {
          url
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
      collections {
        id
        title
        handle
      }
    }
  }
`;

export const getCollectionWithFiltersQuery = `
  query CollectionWithFilters($handle: String!, $filters: [ProductFilter!]) @inContext(country: CA) {
    collection(handle: $handle) {
      id
      title
      description
      products(first: 20, filters: $filters) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        edges {
          node {
            id
            title
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              url
              altText
              width
              height
            }
            options {
              id
              name
              values
            }
          }
        }
      }
    }
  }
`;

export const getProductRecommendationsQuery = `
  query ProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      id
      title
      handle
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 1) {
        nodes {
          url
          altText
          width
          height
        }
        edges {
          node {
            url
            altText
            width
            height
          }
        }
      }
      options {
        id
        name
        values
      }
      variants(first: 25) {
        nodes {
          id
          title
          availableForSale
          quantityAvailable
          image {
            url
            altText
            width
            height
          }
          selectedOptions {
            name
            value
          }
        }
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            image {
              url
              altText
              width
              height
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
`;

export const getSearchWithFiltersQuery = `
  query SearchWithFilters($query: String!, $filters: [ProductFilter!]) @inContext(country: CA) {
    search(query: $query, productFilters: $filters, first: 24, types: [PRODUCT]) {
      productFilters {
        id
        label
        type
        values {
          id
          label
          count
          input
        }
      }
      edges {
        node {
          ... on Product {
            id
            title
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              url
              altText
              width
              height
            }
            images(first: 1) {
              nodes {
                url
                altText
                width
                height
              }
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }
            options {
              id
              name
              values
            }
            variants(first: 25) {
              nodes {
                id
                title
                availableForSale
                quantityAvailable
                image {
                  url
                  altText
                  width
                  height
                }
                selectedOptions {
                  name
                  value
                }
              }
              edges {
                node {
                  id
                  title
                  availableForSale
                  quantityAvailable
                  image {
                    url
                    altText
                    width
                    height
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
      }
    }
  }
`;

export const getShopQuery = `
  query getShop {
    shop {
      name
    }
  }
`;
