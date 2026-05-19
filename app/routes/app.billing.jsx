import { redirect } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const returnUrl = `https://${url.host}/app`;

  try {
    await billing.require({
      plans: ["ChargebackReady Pro"],
      isTest: true,
      onFailure: async () =>
        billing.request({ plan: "ChargebackReady Pro", isTest: true, returnUrl }),
    });
    // Already subscribed — send back to the app
    return redirect("/app");
  } catch (error) {
    // billing.request() throws a Response redirect to Shopify's confirmation page
    if (error instanceof Response) throw error;
    console.error("[Billing Error]", error.message);
    return redirect("/app?billingError=1");
  }
};

export default function BillingPage() {
  return null;
}
