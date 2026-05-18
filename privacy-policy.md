# Privacy Policy — ChargebackReady

**Effective Date:** May 17, 2025
**Last Updated:** May 17, 2025
**Company:** Eleven45 Ventures
**Contact:** ogunwandetobi09@gmail.com

---

## 1. Overview

ChargebackReady ("the App") is a Shopify application developed and operated by Eleven45 Ventures ("we", "us", "our"). This Privacy Policy explains how we collect, use, and protect information when you use ChargebackReady within your Shopify store.

By installing and using ChargebackReady, you agree to the practices described in this policy.

---

## 2. What Data We Access

When you use ChargebackReady to generate a chargeback dispute evidence package, the App accesses the following data from your Shopify store via the Shopify Admin API:

**Order Data**
- Order number, date, and total amount
- Payment gateway name
- AVS (Address Verification System) result code
- CVV verification result code
- Risk assessment score and risk factors
- Customer IP address (as recorded by Shopify at time of purchase)

**Customer Data**
- Customer full name
- Customer email address
- Customer billing address
- Customer shipping address
- Customer account creation date
- Number of previous orders with your store
- Total lifetime spend with your store

**Fulfillment Data**
- Fulfillment status
- Tracking number, carrier, and tracking URL
- Shipment date

**Order Contents**
- Product names, variant names, quantities, and prices
- Customer order notes

---

## 3. Why We Collect This Data

We access the data listed above for one purpose only: **to generate a PDF chargeback dispute evidence package** on behalf of the merchant when they explicitly request it.

The data is used to populate the fields of a professionally formatted PDF document that the merchant can submit to their payment processor or bank as evidence in a chargeback dispute.

---

## 4. How Data Is Processed

- Data is accessed **only when a merchant explicitly clicks "Generate Evidence Package"** for a specific order.
- Data is pulled from Shopify's API at the moment of the request, formatted into a PDF, and returned directly to the merchant's browser.
- **We do not store, cache, or retain any order or customer data** on our servers beyond the duration of a single PDF generation request.
- All API access is **read-only**. ChargebackReady never writes to your store, never modifies orders, and never processes refunds or payments.

---

## 5. What We Do Not Do

- We do **not** store payment card numbers, CVV codes, or full card details. We access only the result codes (e.g. "Match" or "No match") as recorded by Shopify.
- We do **not** sell, share, rent, or trade your data or your customers' data with any third party.
- We do **not** use customer data for marketing, profiling, or any purpose beyond PDF generation.
- We do **not** access your store data in the background or without an explicit merchant action.

---

## 6. Data Storage and Retention

ChargebackReady stores only the following information in our database:

- **Shopify session tokens** — required for authenticated API access, managed by Shopify's official session storage library.
- **Subscription status** — whether your store has an active ChargebackReady subscription, used to gate access to the PDF generation feature.

No order data, customer data, or PDF content is stored in our database at any time.

---

## 7. Data Security

We take reasonable technical and organisational measures to protect data in transit and at rest, including:

- All data is transmitted over HTTPS/TLS.
- We use Shopify's official API authentication and session management libraries.
- Our database stores only non-sensitive session and subscription data.

---

## 8. Third-Party Services

ChargebackReady uses the following third-party services:

| Service | Purpose |
|---------|---------|
| Shopify Admin API | Read-only order data access |
| Railway (infrastructure) | Application hosting |
| Shopify Billing API | Subscription management |

We do not share your data with these services beyond what is technically necessary to operate the App.

---

## 9. Merchant Responsibilities

As a Shopify merchant, you are responsible for ensuring that your use of ChargebackReady complies with applicable data protection laws (including GDPR, CCPA, or other local regulations) as they apply to your customers' data. You should ensure your own store's privacy policy discloses that order data may be used for chargeback dispute purposes.

---

## 10. Your Rights

As a merchant using ChargebackReady, you may:

- **Uninstall the App** at any time through your Shopify Apps page. Uninstalling removes all session data associated with your store from our database.
- **Request deletion** of any data we hold about your store by contacting us at ogunwandetobi09@gmail.com.
- **Request information** about what data we hold by contacting us at the same address.

---

## 11. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify merchants of material changes by updating the "Last Updated" date at the top of this document. Continued use of the App after changes constitutes acceptance of the updated policy.

---

## 12. Contact

If you have any questions about this Privacy Policy or how we handle your data, contact us at:

**Eleven45 Ventures**
Email: ogunwandetobi09@gmail.com

---

*This privacy policy applies to the ChargebackReady Shopify App developed by Eleven45 Ventures.*
