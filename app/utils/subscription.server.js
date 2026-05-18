import db from "../db.server";

export async function hasActiveSubscription(shopDomain) {
  try {
    const sub = await db.subscription.findUnique({
      where: { shopDomain },
    });

    if (!sub || sub.status !== "active") return false;

    const now = new Date();
    if (sub.currentPeriodEnd && sub.currentPeriodEnd < now) return false;

    return true;
  } catch (e) {
    console.error("[hasActiveSubscription error]", e.message);
    return false;
  }
}
