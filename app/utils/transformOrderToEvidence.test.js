import { test } from "node:test";
import assert from "node:assert/strict";
import { transformOrderToEvidence } from "./transformOrderToEvidence.js";

function makeOrder(overrides = {}) {
  return {
    data: {
      order: {
        id: "gid://shopify/Order/1",
        number: 1001,
        name: "#1001",
        createdAt: "2026-05-16T00:00:00Z",
        totalPriceSet: { shopMoney: { amount: "142.99", currencyCode: "USD" } },
        displayFinancialStatus: "PAID",
        displayFulfillmentStatus: "FULFILLED",
        note: "Please leave at door",
        paymentGatewayNames: ["Shopify Payments"],
        transactions: [
          {
            kind: "SALE",
            status: "SUCCESS",
            paymentDetails: { avsResultCode: "Y", cvvResultCode: "M" },
          },
        ],
        risk: {
          assessments: [
            {
              riskLevel: "LOW",
              facts: [{ description: "Card country matches billing country", sentiment: "POSITIVE" }],
            },
          ],
        },
        customer: {
          firstName: "Jane",
          lastName: "Doe",
          email: "jane@example.com",
          phone: "+1 555-0100",
          createdAt: "2024-01-01T00:00:00Z",
          numberOfOrders: 5,
          amountSpent: { amount: "899.95", currencyCode: "USD" },
        },
        billingAddress: {
          firstName: "Jane",
          lastName: "Doe",
          address1: "123 Main St",
          address2: null,
          city: "Springfield",
          province: "IL",
          zip: "62701",
          country: "United States",
        },
        shippingAddress: {
          firstName: "Jane",
          lastName: "Doe",
          address1: "123 Main St",
          address2: null,
          city: "Springfield",
          province: "IL",
          zip: "62701",
          country: "United States",
        },
        fulfillments: [
          {
            trackingInfo: [{ company: "UPS", number: "1Z999AA10123456784", url: "https://ups.com/track?1Z999AA10123456784" }],
            status: "SUCCESS",
            createdAt: "2026-05-17T00:00:00Z",
            estimatedDeliveryAt: null,
          },
        ],
        lineItems: {
          edges: [
            {
              node: {
                title: "Blue Widget",
                variantTitle: "Large",
                quantity: 2,
                sku: "BW-LG",
                originalUnitPriceSet: { shopMoney: { amount: "71.49", currencyCode: "USD" } },
                totalDiscountSet: { shopMoney: { amount: "0.00", currencyCode: "USD" } },
              },
            },
          ],
        },
        ...overrides,
      },
    },
  };
}

// Test 1 — complete order with all fields present
test("complete order with all fields present", () => {
  const result = transformOrderToEvidence(makeOrder());

  assert.equal(result.caseHeader.orderNumber, "#1001");
  assert.equal(result.caseHeader.orderDate, "May 16, 2026");
  assert.ok(result.caseHeader.generatedAt.includes("at"));
  assert.equal(result.transactionProof.amount, "$142.99 USD");
  assert.equal(result.transactionProof.paymentGateway, "Shopify Payments");
  assert.ok(result.transactionProof.avsResult.includes("Y"));
  assert.ok(result.transactionProof.cvvResult.includes("M"));
  assert.equal(result.transactionProof.riskLevel, "Low");
  assert.equal(result.transactionProof.riskFactors.length, 1);
  assert.equal(result.customerIdentity.fullName, "Jane Doe");
  assert.equal(result.customerIdentity.email, "jane@example.com");
  assert.equal(result.customerIdentity.ipAddress, "Not available");
  assert.equal(result.deliveryProof.trackingEntries.length, 1);
  assert.equal(result.deliveryProof.trackingEntries[0].carrier, "UPS");
  assert.equal(result.orderContents.lineItems.length, 1);
  assert.equal(result.orderContents.customerNote, "Please leave at door");
});

// Test 2 — order with no tracking (unfulfilled)
test("order with no tracking information (unfulfilled)", () => {
  const result = transformOrderToEvidence(
    makeOrder({ fulfillments: [], displayFulfillmentStatus: "UNFULFILLED" }),
  );

  assert.equal(result.deliveryProof.fulfillmentStatus, "UNFULFILLED");
  assert.equal(result.deliveryProof.trackingEntries.length, 0);
});

// Test 3 — billing and shipping addresses match
test("billing and shipping addresses match", () => {
  const result = transformOrderToEvidence(makeOrder());

  assert.equal(result.customerIdentity.addressesMatch, true);
  assert.equal(result.customerIdentity.addressMatchSummary, "Billing and shipping addresses match");
});

// Test 4 — billing and shipping addresses do NOT match
test("billing and shipping addresses do not match", () => {
  const result = transformOrderToEvidence(
    makeOrder({
      billingAddress: {
        firstName: "Jane",
        lastName: "Doe",
        address1: "999 Other Ave",
        address2: null,
        city: "Chicago",
        province: "IL",
        zip: "60601",
        country: "United States",
      },
    }),
  );

  assert.equal(result.customerIdentity.addressesMatch, false);
  assert.ok(result.customerIdentity.addressMatchSummary.includes("ADDRESSES DO NOT MATCH"));
});

// Test 5 — null IP address (always Not available since API doesn't expose it)
test("null IP address returns Not available", () => {
  const result = transformOrderToEvidence(makeOrder());

  assert.equal(result.customerIdentity.ipAddress, "Not available");
});

// Test 6 — order with no customer note
test("order with no customer note", () => {
  const result = transformOrderToEvidence(makeOrder({ note: null }));

  assert.equal(result.orderContents.customerNote, "Not provided");
});

// Test 7 — currency formatting with GBP
test("currency formatting with non-USD currency (GBP)", () => {
  const result = transformOrderToEvidence(
    makeOrder({
      totalPriceSet: { shopMoney: { amount: "99.99", currencyCode: "GBP" } },
    }),
  );

  assert.equal(result.transactionProof.amount, "£99.99 GBP");
});

// Test 8 — multiple fulfillments and multiple tracking numbers
test("multiple fulfillments and multiple tracking numbers", () => {
  const result = transformOrderToEvidence(
    makeOrder({
      fulfillments: [
        {
          trackingInfo: [
            { company: "UPS", number: "1Z111", url: "https://ups.com/1Z111" },
            { company: "UPS", number: "1Z222", url: "https://ups.com/1Z222" },
          ],
          status: "SUCCESS",
          createdAt: "2026-05-17T00:00:00Z",
          estimatedDeliveryAt: null,
        },
        {
          trackingInfo: [
            { company: "FedEx", number: "FX333", url: "https://fedex.com/FX333" },
          ],
          status: "SUCCESS",
          createdAt: "2026-05-18T00:00:00Z",
          estimatedDeliveryAt: null,
        },
      ],
    }),
  );

  assert.equal(result.deliveryProof.trackingEntries.length, 3);
  assert.equal(result.deliveryProof.trackingEntries[0].trackingNumber, "1Z111");
  assert.equal(result.deliveryProof.trackingEntries[1].trackingNumber, "1Z222");
  assert.equal(result.deliveryProof.trackingEntries[2].carrier, "FedEx");
});
