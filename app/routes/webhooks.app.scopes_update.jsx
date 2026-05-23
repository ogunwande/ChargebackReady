import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { payload, session, topic, shop } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);
  const current = payload.current;

  if (session) {
    try {
      await db.session.update({
        where: { id: session.id },
        data: { scope: current.toString() },
      });
    } catch (error) {
      console.error(`[ScopesUpdate] DB error for ${shop}:`, error.message);
    }
  }

  return new Response();
};
