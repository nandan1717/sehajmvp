// GraphQL Queries and Mutations for Shopify Customer Account API (2024-07+)
// Uses OAuth 2.0 + PKCE authentication tokens (Authorization: Bearer <token>)

// Step 3: Account Dashboard Query
export const customerDashboardQuery = `
  query getCustomerDashboard {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      phoneNumber {
        phoneNumber
      }
      defaultAddress {
        id
        firstName
        lastName
        address1
        address2
        city
        province
        zip
        country
      }
    }
  }
`;

// Step 3: Order History Query
export const customerOrdersQuery = `
  query getCustomerOrders($first: Int = 20) {
    customer {
      orders(first: $first) {
        nodes {
          id
          number
          processedAt
          financialStatus
          totalPrice {
            amount
            currencyCode
          }
          fulfillments(first: 1) {
            nodes {
              status
            }
          }
          lineItems(first: 10) {
            nodes {
              id
              title
              quantity
              image {
                url
                altText
              }
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;

// Step 3: Address Book Query
export const customerAddressesQuery = `
  query getCustomerAddresses($first: Int = 10) {
    customer {
      addresses(first: $first) {
        nodes {
          id
          firstName
          lastName
          address1
          address2
          city
          province
          zip
          country
          phoneNumber
        }
      }
    }
  }
`;

// Step 6: Connect Auth to Checkout Mutation
export const customerAccessTokenCreateMutation = `
  mutation {
    customerAccessTokenCreate {
      customerAccessToken {
        accessToken
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Mutations for modifying addresses in Customer Account API
export const customerAddressCreateMutation = `
  mutation customerAddressCreate($address: CustomerAddressInput!) {
    customerAddressCreate(address: $address) {
      customerAddress {
        id
        firstName
        lastName
        address1
        address2
        city
        province
        zip
        country
        phoneNumber
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const customerAddressUpdateMutation = `
  mutation customerAddressUpdate($addressId: ID!, $address: CustomerAddressInput!) {
    customerAddressUpdate(addressId: $addressId, address: $address) {
      customerAddress {
        id
        firstName
        lastName
        address1
        address2
        city
        province
        zip
        country
        phoneNumber
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const customerAddressDeleteMutation = `
  mutation customerAddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors {
        field
        message
      }
    }
  }
`;

export const customerDefaultAddressUpdateMutation = `
  mutation customerDefaultAddressUpdate($addressId: ID!) {
    customerDefaultAddressUpdate(addressId: $addressId) {
      customer {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;
