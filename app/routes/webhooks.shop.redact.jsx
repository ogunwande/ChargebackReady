import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop } = await authenticate.webhook(request);
  console.log(`[GDPR] shop/redact received for ${shop}`);

  try {
    await db.subscription.deleteMany({ where: { shopDomain: shop } });
    await db.session.deleteMany({ where: { shop } });
    console.log(`[GDPR] Deleted all data for ${shop}`);
  } catch (error) {
    console.error(`[GDPR] Error deleting data for ${shop}:`, error.message);
  }

  return new Response(null, { status: 200 });
};
