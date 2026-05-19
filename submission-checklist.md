# Shopify App Store Submission Checklist
## ChargebackReady — May 2026

---

## TECHNICAL REQUIREMENTS

### App Infrastructure
- [x] App is deployed and accessible at a public HTTPS URL
- [x] App uses Shopify OAuth for authentication (no custom login)
- [x] App uses a supported Shopify API version (2026-04)
- [x] Session storage implemented (PostgreSQL via Prisma)
- [x] App handles `app/uninstalled` webhook to clean up session data
- [x] App handles `app/scopes_update` webhook
- [x] App handles `app/subscriptions/update` webhook (billing)
- [x] All API calls use HTTPS
- [x] App embedded in Shopify Admin (embedded: true in toml)
- [x] App passes Shopify's security headers via `boundary.headers()`
- [x] No use of deprecated API fields (riskAssessments used, not risk.assessments)

### Billing
- [x] Billing implemented via Shopify Billing API (not external payment)
- [x] Free trial configured (7 days)
- [x] Plan name matches exactly between `shopify.server.js` and `billing.require()` calls
- [ ] **Remove `isTest: true` from billing before going live** — production stores will reject this
- [x] `BillingInterval.Every30Days` configured
- [x] Subscription webhook handler present

### OAuth Scopes
- [x] Only requesting scopes actually used: `read_orders`, `read_customers`, `read_fulfillments`
- [x] No write scopes requested
- [x] Scopes declared in `shopify.app.chargebackready.toml`

### Redirect URLs
- [x] All redirect URLs registered in Partner Dashboard
- [x] All redirect URLs use HTTPS
- [x] Redirect URLs match Railway production domain

### Performance
- [x] GraphQL queries include retry logic for THROTTLED errors
- [ ] Verify app loads within 3 seconds in Shopify Admin on a slow connection

---

## LISTING REQUIREMENTS

### App Identity
- [x] App name: "ChargebackReady — Dispute Evidence"
- [x] Tagline written (under 100 characters)
- [x] Short description written (under 100 words)
- [x] Long description written (400–500 words)
- [x] Key benefits written (5 bullet points)
- [x] App icon created (`app-icon.svg`)
- [ ] **Convert app-icon.svg to PNG 1024×1024** — Shopify requires PNG format, not SVG
- [ ] **Take 3–6 screenshots** at 1280×800 or 2560×1600 pixels
  - [ ] Screenshot 1: Main order lookup screen
  - [ ] Screenshot 2: Order found / preview card
  - [ ] Screenshot 3: PDF cover page
  - [ ] Screenshot 4: PDF evidence detail page
  - [ ] Screenshot 5: Trial/billing banner (optional but recommended)
- [ ] Optionally record a demo video (30–60 seconds showing the full flow)

### Pricing
- [x] Pricing documented ($19/month, 7-day free trial)
- [ ] Confirm pricing entered correctly in Partner Dashboard

---

## LEGAL REQUIREMENTS

### Privacy Policy
- [x] Privacy policy written (`privacy-policy.md`)
- [ ] **Host the privacy policy at a public URL** — add a `/privacy` route to the Railway app or host on a separate page
- [ ] Add that URL to your Partner Dashboard app listing
- [ ] Privacy policy must be accessible without logging in

### Terms of Service (optional but recommended)
- [ ] Write a Terms of Service document
- [ ] Host it at a public URL
- [ ] Add to Partner Dashboard

### GDPR Mandatory Webhooks (required by Shopify for all apps)
- [ ] Implement `customers/data_request` webhook handler (return 200 — no data stored)
- [ ] Implement `customers/redact` webhook handler (return 200 — no data stored)
- [ ] Implement `shop/redact` webhook handler (delete session row for the shop)
- [ ] Register all three GDPR webhooks in `shopify.app.chargebackready.toml`

> **Note:** These three GDPR webhooks are mandatory for App Store submission. Since ChargebackReady doesn't persistently store order or customer data, the first two handlers can simply return 200 OK. The `shop/redact` handler should delete the session row for that shop from the database.

---

## PARTNER DASHBOARD TASKS (manual steps)

- [ ] Log in at partners.shopify.com
- [ ] Go to Apps → ChargebackReady2 → App setup
- [ ] Fill in app listing using content from `app-store-listing.md`
- [ ] Upload app icon (PNG 1024×1024)
- [ ] Upload screenshots (minimum 3)
- [ ] Set pricing: $19/month with 7-day free trial
- [ ] Enter privacy policy URL
- [ ] Enter support email: ogunwandetobi09@gmail.com
- [ ] Set app category: Store management
- [ ] Confirm all redirect URLs are registered
- [ ] Remove `isTest: true` from billing before submitting for review
- [ ] Click "Submit for review"

---

## PRE-SUBMISSION TESTING

- [ ] Install the app fresh on a development store
- [ ] Complete the OAuth flow — confirm landing on app home screen
- [ ] Enter a real order number — confirm order preview loads
- [ ] Confirm "Start free trial" banner appears (unsubscribed state)
- [ ] Click "Start free trial" — confirm Shopify billing confirmation page loads
- [ ] Approve the trial — confirm redirect back to app
- [ ] Enter order number again — confirm "Download PDF" button appears
- [ ] Download a PDF — confirm it opens with real order data
- [ ] Uninstall the app — confirm session is cleaned up
- [ ] Reinstall — confirm OAuth works cleanly again

---

## REMAINING TASKS BEFORE SUBMISSION (priority order)

1. **Remove `isTest: true`** from `app/routes/app.billing.jsx` — required for production
2. **Convert app-icon.svg to PNG 1024×1024** — use Figma, Inkscape, or any online SVG-to-PNG tool
3. **Host privacy policy at a public URL** — add `/privacy` route to the app returning the policy HTML
4. **Implement GDPR webhooks** — three mandatory handlers; two return 200, one deletes session
5. **Take app store screenshots** — real screenshots from the live Railway app
6. **Fill in Partner Dashboard listing** — paste from `app-store-listing.md`

---

*Generated May 2026 — verify against current requirements at shopify.dev/docs/apps/store*
