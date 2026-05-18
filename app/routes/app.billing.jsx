import { redirect } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const returnUrl = `${url.protocol}//${url.host}/app`;

  console.log("[Billing Debug] shop:", session.shop);
  console.log("[Billing Debug] returnUrl:", returnUrl);
  console.log("[Billing Debug] plan: ChargebackReady Pro");

  try {
    console.log("[Billing Debug] About to call billing.request with:", {
      plan: "ChargebackReady Pro",
      isTest: true,
      returnUrl,
      shop: session.shop,
      accessToken: session.accessToken ? "present" : "MISSING",
      scope: session.scope,
    });

    const billingResponse = await billing.request({
      plan: "ChargebackReady Pro",
      isTest: true,
      returnUrl,
    });

    console.log("[Billing Debug] response:", JSON.stringify(billingResponse, null, 2));

    if (!billingResponse?.confirmationUrl) {
      console.error("[Billing Error] No confirmationUrl in response:", billingResponse);
      throw new Error("No confirmation URL returned from Shopify");
    }

    return redirect(billingResponse.confirmationUrl);
  } catch (error) {
    console.error("[Billing Error] Full error:", error.message);
    console.error("[Billing Error] Stack:", error.stack);
    return new Response(
      JSON.stringify({ error: "billing_failed", message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

export default function BillingPage() {
  return null;
}
