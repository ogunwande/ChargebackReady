import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, payload, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  const sub = payload?.app_subscription;
  if (!sub) return new Response(null, { status: 200 });

  const status = (sub.status || "").toLowerCase();
  const trialEndsAt   = sub.trial_ends_on   ? new Date(sub.trial_ends_on)         : null;
  const currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end) : null;

  await db.subscription.upsert({
    where:  { shopDomain: shop },
    create: { shopDomain: shop, status, trialEndsAt, currentPeriodEnd },
    update: { status, trialEndsAt, currentPeriodEnd },
  });

  return new Response(null, { status: 200 });
};
