import { authenticate } from "../shopify.server";

const ORDER_EVIDENCE_QUERY = `#graphql
  query GetOrderEvidence($orderId: ID!) {
    order(id: $orderId) {
      id
      name
      createdAt
      note
      clientIp

      displayFinancialStatus
      displayFulfillmentStatus

      totalPriceSet {
        shopMoney { amount currencyCode }
      }

      paymentGatewayNames

      transactions(first: 10) {
        kind
        status
        gateway
        formattedGateway
        amountSet {
          shopMoney { amount currencyCode }
        }
        paymentDetails {
          ... on CardPaymentDetails {
            avsResultCode
            cvvResultCode
            bin
            company
            expirationMonth
            expirationYear
            name
            wallet
          }
        }
      }

      riskAssessments {
        riskLevel
        facts {
          description
          sentiment
        }
        provider {
          title
        }
      }

      customer {
        firstName
        lastName
        email
        phone
        createdAt
        numberOfOrders
        amountSpent {
          amount
          currencyCode
        }
      }

      billingAddress {
        firstName
        lastName
        address1
        address2
        city
        province
        zip
        country
      }

      shippingAddress {
        firstName
        lastName
        address1
        address2
        city
        province
        zip
        country
      }

      fulfillments {
        status
        createdAt
        estimatedDeliveryAt
        trackingInfo {
          company
          number
          url
        }
      }

      lineItems(first: 50) {
        edges {
          node {
            title
            variantTitle
            quantity
            sku
            originalUnitPriceSet {
              shopMoney { amount currencyCode }
            }
            totalDiscountSet {
              shopMoney { amount currencyCode }
            }
          }
        }
      }
    }
  }
`;

export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const orderId = `gid://shopify/Order/${params.orderId}`;

  const response = await admin.graphql(ORDER_EVIDENCE_QUERY, {
    variables: { orderId },
  });

  const data = await response.json();

  return new Response(JSON.stringify(data, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
};
