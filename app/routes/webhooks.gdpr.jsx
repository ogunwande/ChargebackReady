import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { topic, shop } = await authenticate.webhook(request);
  console.log(`[GDPR] ${topic} received for ${shop}`);

  switch (topic) {
    case "CUSTOMERS_DATA_REQUEST":
      // We don't store individual customer data — nothing to export
      break;
    case "CUSTOMERS_REDACT":
      // We don't store individual customer data — nothing to delete
      break;
    case "SHOP_REDACT":
      // Delete all shop data
      await db.subscription.deleteMany({ where: { shopDomain: shop } });
      await db.session.deleteMany({ where: { shop } });
      console.log(`[GDPR] Deleted all data for ${shop}`);
      break;
  }

  return new Response(null, { status: 200 });
};
