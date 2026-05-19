const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const AVS_CODES = {
  Y: "Full match (address and ZIP)",
  A: "Address match only",
  Z: "ZIP match only",
  N: "No match",
  U: "Unavailable",
  S: "Service not supported",
  R: "Retry",
  E: "Error",
  D: "International exact match",
  M: "International exact match",
  B: "International address match",
  P: "International ZIP match",
  W: "Whole ZIP match (9-digit)",
  X: "Exact match (address and 9-digit ZIP)",
};

const CVV_CODES = {
  M: "Match",
  N: "No match",
  P: "Not processed",
  S: "Should have been present",
  U: "Issuer unable to process",
  X: "No response",
};

function formatDate(isoString) {
  if (!isoString) return "Not provided";
  const d = new Date(isoString);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function formatDateTime(date) {
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${month} ${day}, ${year} at ${hours}:${minutes} ${ampm}`;
}

function getCurrencySymbol(code) {
  const symbols = { USD: "$", GBP: "£", EUR: "€", CAD: "C$", AUD: "A$", JPY: "¥" };
  return symbols[code] || "$";
}

function formatCurrency(amount, currencyCode) {
  if (amount === null || amount === undefined) return "Not available";
  const code = currencyCode || "USD";
  return `${getCurrencySymbol(code)}${parseFloat(amount).toFixed(2)} ${code}`;
}

function formatAddress(addr) {
  if (!addr) {
    return {
      line1: "Not provided",
      line2: "Not provided",
      city: "Not provided",
      province: "Not provided",
      zip: "Not provided",
      country: "Not provided",
      fullFormatted: "Not provided",
    };
  }
  const line1 = addr.address1 || "Not provided";
  const line2 = addr.address2 || "Not provided";
  const city = addr.city || "Not provided";
  const province = addr.province || "Not provided";
  const zip = addr.zip || "Not provided";
  const country = addr.country || "Not provided";

  const parts = [line1];
  if (addr.address2) parts.push(addr.address2);
  parts.push(`${city}, ${province} ${zip}`);
  parts.push(country);

  return { line1, line2, city, province, zip, country, fullFormatted: parts.join(", ") };
}

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

function compareAddresses(billing, shipping) {
  if (!billing || !shipping) return false;
  return (
    normalize(billing.address1) === normalize(shipping.address1) &&
    normalize(billing.city) === normalize(shipping.city) &&
    normalize(billing.zip) === normalize(shipping.zip) &&
    normalize(billing.country) === normalize(shipping.country)
  );
}

function getCardDetails(transactions) {
  if (!transactions || transactions.length === 0) return null;
  for (const tx of transactions) {
    if (tx.paymentDetails) return tx.paymentDetails;
  }
  return null;
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

function getRiskFactors(assessments) {
  if (!assessments || assessments.length === 0) return [];
  return assessments.flatMap((a) => (a.facts || []).map((f) => f.description || "Not provided"));
}

export function transformOrderToEvidence(rawGraphQLResponse) {
  const order = rawGraphQLResponse?.data?.order || {};
  const customer = order.customer || {};
  const billing = order.billingAddress || null;
  const shipping = order.shippingAddress || null;
  const assessments = order.risk?.assessments || [];
  const cardDetails = getCardDetails(order.transactions || []);
  const avsCode = cardDetails?.avsResultCode || null;
  const cvvCode = cardDetails?.cvvResultCode || null;
  const fulfillments = order.fulfillments || [];
  const lineItems = order.lineItems?.edges || [];
  const amount = order.totalPriceSet?.shopMoney?.amount;
  const currencyCode = order.totalPriceSet?.shopMoney?.currencyCode || "USD";
  const billingFormatted = formatAddress(billing);
  const shippingFormatted = formatAddress(shipping);
  const addressesMatch = compareAddresses(billing, shipping);

  const trackingEntries = [];
  for (const fulfillment of fulfillments) {
    const infos = fulfillment.trackingInfo || [];
    if (infos.length === 0) {
      trackingEntries.push({
        trackingNumber: "Not provided",
        carrier: "Not provided",
        trackingUrl: "Not provided",
        status: fulfillment.status || "Unknown",
        shippedDate: formatDate(fulfillment.createdAt),
      });
    } else {
      for (const info of infos) {
        trackingEntries.push({
          trackingNumber: info.number || "Not provided",
          carrier: info.company || "Not provided",
          trackingUrl: info.url || "Not provided",
          status: fulfillment.status || "Unknown",
          shippedDate: formatDate(fulfillment.createdAt),
        });
      }
    }
  }

  return {
    caseHeader: {
      orderNumber: order.name || "Not provided",
      orderDate: formatDate(order.createdAt),
      generatedAt: formatDateTime(new Date()),
      merchantNote:
        "This document contains confidential transaction evidence compiled automatically from Shopify order data.",
    },
    transactionProof: {
      amount: formatCurrency(amount, currencyCode),
      paymentGateway: (order.paymentGatewayNames || [])[0] || "Not provided",
      avsResult: avsCode
        ? `${avsCode} — ${AVS_CODES[avsCode] || "Unknown code"}`
        : "Not available",
      cvvResult: cvvCode
        ? `${cvvCode} — ${CVV_CODES[cvvCode] || "Unknown code"}`
        : "Not available",
      threeDSecure: "Not available",
      riskLevel: getHighestRiskLevel(assessments),
      riskFactors: getRiskFactors(assessments),
    },
    customerIdentity: {
      fullName:
        customer.firstName || customer.lastName
          ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
          : "Not provided",
      email: customer.email || "Not provided",
      phone: customer.phone || "Not provided",
      ipAddress: "Not available",
      customerSince: formatDate(customer.createdAt),
      totalOrdersWithStore: customer.numberOfOrders ?? 0,
      totalLifetimeSpend: formatCurrency(
        customer.amountSpent?.amount,
        customer.amountSpent?.currencyCode || currencyCode,
      ),
      billingAddress: billingFormatted,
      shippingAddress: shippingFormatted,
      addressesMatch,
      addressMatchSummary: addressesMatch
        ? "Billing and shipping addresses match"
        : `ADDRESSES DO NOT MATCH — billing: ${billingFormatted.fullFormatted} / shipping: ${shippingFormatted.fullFormatted}`,
    },
    deliveryProof: {
      fulfillmentStatus: order.displayFulfillmentStatus || "Unknown",
      trackingEntries,
    },
    orderContents: {
      lineItems: lineItems.map(({ node }) => ({
        productName: node.title || "Not provided",
        variantName: node.variantTitle || "Not provided",
        sku: node.sku || "Not provided",
        quantity: node.quantity ?? 0,
        unitPrice: formatCurrency(
          node.originalUnitPriceSet?.shopMoney?.amount,
          node.originalUnitPriceSet?.shopMoney?.currencyCode || currencyCode,
        ),
        totalPrice: formatCurrency(
          node.originalUnitPriceSet?.shopMoney?.amount
            ? String(
                parseFloat(node.originalUnitPriceSet.shopMoney.amount) * (node.quantity ?? 1),
              )
            : null,
          node.originalUnitPriceSet?.shopMoney?.currencyCode || currencyCode,
        ),
      })),
      customerNote: order.note || "Not provided",
    },
  };
}
