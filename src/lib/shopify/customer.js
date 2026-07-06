import { shopifyFetch } from './client';

// GraphQL Mutations and Queries for Shopify Storefront API Customer Accounts
export const customerAccessTokenCreateMutation = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const customerCreateMutation = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const customerUpdateMutation = `
  mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        id
        firstName
        lastName
        email
        phone
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const getCustomerQuery = `
  query getCustomerDetails($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      defaultAddress {
        id
        address1
        address2
        city
        province
        zip
        country
        phone
        firstName
        lastName
      }
      addresses(first: 10) {
        edges {
          node {
            id
            address1
            address2
            city
            province
            zip
            country
            phone
            firstName
            lastName
          }
        }
      }
      orders(first: 20) {
        edges {
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    image {
                      url
                      altText
                    }
                    product {
                      handle
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

export const customerAddressCreateMutation = `
  mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress {
        id
        address1
        address2
        city
        province
        zip
        country
        phone
        firstName
        lastName
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const customerAddressUpdateMutation = `
  mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
    customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
      customerAddress {
        id
        address1
        address2
        city
        province
        zip
        country
        phone
        firstName
        lastName
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const customerAddressDeleteMutation = `
  mutation customerAddressDelete($customerAccessToken: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
      deletedCustomerAddressId
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const customerDefaultAddressUpdateMutation = `
  mutation customerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) {
    customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// Helper API calls with Shopify Storefront API execution and error fallbacks
export async function loginCustomer(email, password) {
  try {
    const { body } = await shopifyFetch({
      query: customerAccessTokenCreateMutation,
      variables: { input: { email, password } },
      cache: 'no-store'
    });

    const result = body?.data?.customerAccessTokenCreate;
    if (result?.customerUserErrors && result.customerUserErrors.length > 0) {
      return { success: false, errors: result.customerUserErrors };
    }

    const token = result?.customerAccessToken?.accessToken;
    if (token) {
      return { success: true, token };
    }
    return { success: false, errors: [{ message: 'Invalid credentials or login failed.' }] };
  } catch (error) {
    console.error('Shopify login API error, falling back:', error);
    return { success: false, networkError: true };
  }
}

export async function registerCustomer(firstName, lastName, email, password) {
  try {
    const { body } = await shopifyFetch({
      query: customerCreateMutation,
      variables: { input: { firstName, lastName, email, password } },
      cache: 'no-store'
    });

    const result = body?.data?.customerCreate;
    if (result?.customerUserErrors && result.customerUserErrors.length > 0) {
      return { success: false, errors: result.customerUserErrors };
    }

    if (result?.customer?.id) {
      return { success: true };
    }
    return { success: false, errors: [{ message: 'Registration failed.' }] };
  } catch (error) {
    console.error('Shopify register API error, falling back:', error);
    return { success: false, networkError: true };
  }
}

export async function fetchCustomerDetails(token) {
  try {
    const { body } = await shopifyFetch({
      query: getCustomerQuery,
      variables: { customerAccessToken: token },
      cache: 'no-store'
    });

    const customer = body?.data?.customer;
    if (customer) {
      return { success: true, customer };
    }
    return { success: false, errors: [{ message: 'Could not fetch customer details.' }] };
  } catch (error) {
    console.error('Shopify fetchCustomerDetails error:', error);
    return { success: false, networkError: true };
  }
}

export async function createCustomerAddress(token, addressInput) {
  try {
    const { body } = await shopifyFetch({
      query: customerAddressCreateMutation,
      variables: { customerAccessToken: token, address: addressInput },
      cache: 'no-store'
    });

    const result = body?.data?.customerAddressCreate;
    if (result?.customerUserErrors && result.customerUserErrors.length > 0) {
      return { success: false, errors: result.customerUserErrors };
    }

    if (result?.customerAddress) {
      return { success: true, address: result.customerAddress };
    }
    return { success: false, errors: [{ message: 'Address creation failed.' }] };
  } catch (error) {
    return { success: false, networkError: true };
  }
}

export async function updateCustomerAddress(token, addressId, addressInput) {
  try {
    const { body } = await shopifyFetch({
      query: customerAddressUpdateMutation,
      variables: { customerAccessToken: token, id: addressId, address: addressInput },
      cache: 'no-store'
    });

    const result = body?.data?.customerAddressUpdate;
    if (result?.customerUserErrors && result.customerUserErrors.length > 0) {
      return { success: false, errors: result.customerUserErrors };
    }

    if (result?.customerAddress) {
      return { success: true, address: result.customerAddress };
    }
    return { success: false, errors: [{ message: 'Address update failed.' }] };
  } catch (error) {
    return { success: false, networkError: true };
  }
}

export async function deleteCustomerAddress(token, addressId) {
  try {
    const { body } = await shopifyFetch({
      query: customerAddressDeleteMutation,
      variables: { customerAccessToken: token, id: addressId },
      cache: 'no-store'
    });

    const result = body?.data?.customerAddressDelete;
    if (result?.customerUserErrors && result.customerUserErrors.length > 0) {
      return { success: false, errors: result.customerUserErrors };
    }

    if (result?.deletedCustomerAddressId) {
      return { success: true };
    }
    return { success: false, errors: [{ message: 'Address deletion failed.' }] };
  } catch (error) {
    return { success: false, networkError: true };
  }
}

export async function setDefaultCustomerAddress(token, addressId) {
  try {
    const { body } = await shopifyFetch({
      query: customerDefaultAddressUpdateMutation,
      variables: { customerAccessToken: token, addressId },
      cache: 'no-store'
    });

    const result = body?.data?.customerDefaultAddressUpdate;
    if (result?.customerUserErrors && result.customerUserErrors.length > 0) {
      return { success: false, errors: result.customerUserErrors };
    }

    return { success: true };
  } catch (error) {
    return { success: false, networkError: true };
  }
}

export async function updateCustomerProfile(token, customerInput) {
  try {
    const { body } = await shopifyFetch({
      query: customerUpdateMutation,
      variables: { customerAccessToken: token, customer: customerInput },
      cache: 'no-store'
    });

    const result = body?.data?.customerUpdate;
    if (result?.customerUserErrors && result.customerUserErrors.length > 0) {
      return { success: false, errors: result.customerUserErrors };
    }

    if (result?.customer) {
      return { success: true, customer: result.customer };
    }
    return { success: false, errors: [{ message: 'Profile update failed.' }] };
  } catch (error) {
    return { success: false, networkError: true };
  }
}

