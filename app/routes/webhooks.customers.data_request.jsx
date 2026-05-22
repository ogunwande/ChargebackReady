import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop } = await authenticate.webhook(request);
  console.log(`[GDPR] customers/data_request received for ${shop}`);
  // ChargebackReady only reads order data during active sessions
  // We do not store personal customer data beyond the session
  // No data export is required
  return new Response(null, { status: 200 });
};
