import { authenticate } from "../shopify.server";

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

const ORDER_PREVIEW_QUERY = `#graphql
  query GetOrderPreview($query: String!) {
    orders(first: 1, query: $query) {
      edges {
        node {
          id
          name
          createdAt
          displayFinancialStatus
          displayFulfillmentStatus
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          customer {
            firstName
            lastName
          }
          risk {
            assessments {
              riskLevel
            }
          }
        }
      }
    }
  }
`;

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function formatDate(isoString) {
  if (!isoString) return "Not provided";
  const d = new Date(isoString);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function formatAmount(totalPriceSet) {
  const { amount, currencyCode } = totalPriceSet?.shopMoney || {};
  if (!amount) return "Not available";
  const symbols = { USD: "$", GBP: "£", EUR: "€", CAD: "C$", AUD: "A$" };
  return `${symbols[currencyCode] || "$"}${parseFloat(amount).toFixed(2)} ${currencyCode}`;
}

function getHighestRiskLevel(assessments) {
  if (!assessments || assessments.length === 0) return "Not available";
  const weight = { HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 };
  let highest = "NONE";
  for (const a of assessments) {
    if ((weight[a.riskLevel] || 0) > (weight[highest] || 0)) highest = a.riskLevel;
  }
  if (highest === "NONE") return "Not available";
  return highest.charAt(0) + highest.slice(1).toLowerCase();
}

export const loader = async ({ request, params }) => {
  let adminContext;
  try {
    adminContext = await authenticate.admin(request);
  } catch (error) {
    if (error instanceof Response) throw error;
    return new Response(
      JSON.stringify({ error: "auth_required", message: "Please refresh and try again" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }
  const { admin } = adminContext;

  const raw = params.orderId.replace(/^#/, "").trim();

  if (!raw || !/^\d{1,20}$/.test(raw)) {
    return new Response(
      JSON.stringify({ error: "invalid_input", message: "Invalid order ID format" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  let data;
  try {
    data = await graphqlWithRetry(admin, ORDER_PREVIEW_QUERY, { query: `name:#${raw}` });
  } catch {
    return new Response(
      JSON.stringify({ error: "throttled", message: "Shopify is temporarily unavailable. Wait 30 seconds and try again." }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }
  const edges = data?.data?.orders?.edges || [];

  if (edges.length === 0) {
    return new Response(
      JSON.stringify({ error: "not_found", message: "Order not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  const order = edges[0].node;
  const customer = order.customer;
  const customerName = customer
    ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Guest"
    : "Guest";

  return new Response(
    JSON.stringify({
      numericId: order.id.replace("gid://shopify/Order/", ""),
      orderNumber: order.name,
      customerName,
      orderDate: formatDate(order.createdAt),
      amount: formatAmount(order.totalPriceSet),
      riskLevel: getHighestRiskLevel(order.risk?.assessments || []),
      fulfillmentStatus: order.displayFulfillmentStatus || "Unknown",
      financialStatus: order.displayFinancialStatus || "Unknown",
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
