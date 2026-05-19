# Privacy Policy — ChargebackReady

**Last updated:** May 2026
**Company:** Eleven45 Ventures
**Contact:** ogunwandetobi09@gmail.com

---

## 1. Introduction

ChargebackReady ("the App", "we", "us", "our") is a Shopify application developed and operated by Eleven45 Ventures. This Privacy Policy explains how we collect, use, and protect information when you install and use the App through the Shopify platform.

By installing ChargebackReady, you agree to the practices described in this policy.

---

## 2. What Data We Collect

When you use ChargebackReady to generate a chargeback dispute evidence package, we access the following data from your Shopify store via the Shopify Admin API:

**Order Data**
- Order number, date, total amount, and currency
- Financial status and fulfillment status
- Payment gateway used
- Payment verification codes (AVS result, CVV result) — accessed read-only, never stored
- IP address recorded by Shopify at the time of checkout
- Customer note on the order

**Customer Data**
- Customer first name, last name, email address, and phone number
- Customer account creation date
- Customer order history summary (total number of orders, total lifetime spend)
- Billing address and shipping address

**Fulfillment & Delivery Data**
- Tracking company, tracking number, and tracking URL
- Fulfillment status and creation date
- Estimated delivery date (if available)

**Fraud Risk Data**
- Shopify's risk assessment level and risk factors for the order (read-only, calculated by Shopify)

**Line Item Data**
- Product title, variant, quantity, price, SKU, and discount applied

---

## 3. How We Use This Data

All data listed above is accessed **solely for the purpose of generating a chargeback dispute evidence PDF document** at the explicit request of the merchant.

Specifically, we use this data to:
- Compile a structured evidence package suitable for submission to payment processors and banks in chargeback disputes
- Display an order preview so the merchant can confirm they have the correct order before generating a PDF
- Generate and deliver the PDF document to the merchant's browser

**We do not use this data for any other purpose.**

---

## 4. Data Storage

ChargebackReady operates with a minimal data storage footprint:

- **Session data:** We store Shopify OAuth session tokens in a secure PostgreSQL database hosted on Railway (railway.app) solely to maintain your authenticated session with the App. Session data is standard Shopify session information and does not include order data.
- **Order data:** We do **not** persistently store order data, customer data, or generated PDF content. Order information is fetched from Shopify on demand when you request a PDF, used to generate the document, and is not written to any database.
- **PDF documents:** Generated PDFs are delivered directly to your browser and are not stored on our servers.
- **Payment card data:** We do **not** store, log, or retain any payment card information (card numbers, expiry dates, CVV codes). AVS and CVV result codes are passed through read-only from Shopify's API for inclusion in the evidence document only.

---

## 5. Data Sharing and Third Parties

**We do not sell, rent, or trade your data or your customers' data to any third party.**

We share data with the following service providers only to the extent necessary to operate the App:

| Provider | Purpose | Data Shared |
|----------|---------|-------------|
| Railway (railway.app) | Application hosting and PostgreSQL database | Shopify session tokens only |
| Shopify | Platform API access | OAuth tokens for your store |

We do not use advertising networks, analytics platforms, or data brokers.

---

## 6. API Access Scope

ChargebackReady uses **read-only** Shopify API access. The App requests the following OAuth scopes:

- `read_orders` — to fetch order details for evidence generation
- `read_customers` — to fetch customer identity information for evidence generation
- `read_fulfillments` — to fetch delivery and tracking information for evidence generation

The App **never** requests write access to your store. It cannot:
- Create, modify, or cancel orders
- Issue refunds
- Modify customer records
- Access payment settings or financial accounts
- Publish or modify products

---

## 7. Data Security

We implement the following security measures to protect your data:

- All data in transit is encrypted using TLS/HTTPS
- Database connections use encrypted connections
- Shopify OAuth tokens are stored securely and never exposed in logs or client-side code
- The App runs in an isolated server environment

---

## 8. Data Retention

- **Session tokens** are retained until you uninstall the App, at which point they are deleted via the `app/uninstalled` webhook.
- **Order data** is never persistently stored and therefore has no retention period.
- **Generated PDFs** are never stored on our servers.

When you uninstall ChargebackReady, your session data is permanently deleted from our database within 48 hours.

---

## 9. Your Rights

As a merchant using ChargebackReady, you have the right to:

- **Access:** Request a copy of any data we hold about your store
- **Deletion:** Request deletion of your session data at any time by uninstalling the App or contacting us directly
- **Correction:** Request correction of any inaccurate data we hold

To exercise any of these rights, contact us at: **ogunwandetobi09@gmail.com**

Regarding your customers' data: ChargebackReady accesses customer data on your behalf to generate evidence documents. You are responsible for ensuring your store's own privacy policy covers the use of third-party apps that access customer data for fraud prevention and dispute purposes.

---

## 10. Children's Privacy

ChargebackReady is a business-to-business application intended for use by Shopify merchants. It is not directed at or intended for use by individuals under the age of 18. We do not knowingly collect personal data from minors.

---

## 11. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify merchants of material changes by updating the "Last updated" date at the top of this page and, where appropriate, through the Shopify app notification system.

Continued use of ChargebackReady after changes are posted constitutes acceptance of the updated policy.

---

## 12. Contact

If you have any questions about this Privacy Policy or our data practices, please contact:

**Eleven45 Ventures**
Email: ogunwandetobi09@gmail.com

---

*ChargebackReady is not affiliated with Shopify Inc. Shopify is a trademark of Shopify Inc.*
