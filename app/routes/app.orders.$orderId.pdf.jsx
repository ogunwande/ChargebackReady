import { authenticate } from "../shopify.server";
import { transformOrderToEvidence } from "../utils/transformOrderToEvidence";
import { generateChargebackPDF } from "../utils/generateChargebackPDF";
import { hasActiveSubscription } from "../utils/subscription.server";

async function graphqlWithRetry(admin, query, variables) {
  const res = await admin.graphql(query, { variables });
  const data = await res.json();
  const throttled = data?.errors?.some((e) => e.extensions?.code === "THROTTLED");
  if (!throttled) return data;
  await new Promise((r) => setTimeout(r, 1500));
  const res2 = await admin.graphql(query, { variables });
  const data2 = await res2.json();
  if (data2?.errors?.some((e) => e.extensions?.code === "THROTTLED")) {
    throw new Error("THROTTLED");
  }
  return data2;
}

const ORDER_EVIDENCE_QUERY = `#graphql
  query GetOrderEvidence($orderId: ID!) {
    order(id: $orderId) {
      id
      name
      createdAt
      clientIp
      totalPriceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      displayFinancialStatus
      displayFulfillmentStatus
      note
      paymentGatewayNames

      transactions {
        kind
        status
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

      risk {
        assessments {
          riskLevel
          facts {
            description
            sentiment
          }
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
        trackingInfo {
          company
          number
          url
        }
        status
        createdAt
        estimatedDeliveryAt
      }

      lineItems(first: 50) {
        edges {
          node {
            title
            variantTitle
            quantity
            sku
            originalUnitPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            totalDiscountSet {
              shopMoney {
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

export const loader = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);

  if (!(await hasActiveSubscription(session.shop))) {
    return new Response(
      JSON.stringify({ error: "upgrade_required", message: "Upgrade to Pro to download evidence packages" }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  const orderId = `gid://shopify/Order/${params.orderId}`;

  let rawData;
  try {
    rawData = await graphqlWithRetry(admin, ORDER_EVIDENCE_QUERY, { orderId });
  } catch {
    return new Response(
      JSON.stringify({ error: "throttled", message: "Shopify is temporarily unavailable. Wait 30 seconds and try again." }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!rawData?.data?.order) {
    return new Response(JSON.stringify({ error: "Order not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const evidence = transformOrderToEvidence(rawData);

  let pdfBuffer;
  try {
    pdfBuffer = await generateChargebackPDF(evidence);
  } catch (error) {
    console.error("[ChargebackReady PDF Error]", error);
    return new Response(
      JSON.stringify({ error: "pdf_failed", message: "PDF generation failed. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const orderName = rawData.data.order.name?.replace("#", "") || params.orderId;
  const filename = `chargeback-evidence-${orderName}.pdf`;

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(pdfBuffer.length),
    },
  });
};
