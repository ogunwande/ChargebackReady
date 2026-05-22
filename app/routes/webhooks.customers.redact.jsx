import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop } = await authenticate.webhook(request);
  console.log(`[GDPR] customers/redact received for ${shop}`);
  // We do not store individual customer data
  // Sessions are shop-level not customer-level
  return new Response(null, { status: 200 });
};
